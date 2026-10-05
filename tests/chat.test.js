import test from 'node:test';
import assert from 'node:assert/strict';
import { runAgent } from '../server/api.js';
import { chatErrorEvent } from '../server/chatErrors.js';
import { sendMessage } from '../src/services/chatService.js';
import { hpapRealData } from '../src/data/hpapRealData.js';
import handler from '../api/chat.js';

const messages = [{ role: 'user', content: 'Show me all T1D donors from HPAP' }];
const marker = '[DATASET:hpap|label=HPAP — T1D Donors|filters=clinical_diagnosis:contains:T1DM]';
const final = { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: marker }] }] };
const call = (args, id = 'call_1') => ({ type: 'function_call', name: 'filter_donors', call_id: id, arguments: JSON.stringify(args) });
const filter = { dataset_id: 'hpap', filters: [{ column: 'clinical_diagnosis', operator: 'contains', value: 'T1DM' }] };
const expected = hpapRealData.filter(r => r.clinical_diagnosis.includes('T1DM'));

function streamResponse(events, separator = '\n\n') {
  const bytes = new TextEncoder().encode(events.map(e => `data: ${JSON.stringify(e)}`).join(separator));
  // Byte-at-a-time chunks also exercise split UTF-8 sequences and delimiters.
  return new Response(new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
    controller.close();
  } }), { headers: { 'Content-Type': 'text/event-stream' } });
}

test('OpenAI tool loop uses actual HPAP rows and preserves stateless continuation', async () => {
  const events = [];
  let turn = 0;
  const reasoning = { type: 'reasoning', id: 'rs_1', encrypted_content: 'opaque-test-value', summary: [] };
  const client = { responses: { create: async (request, options) => {
    assert.equal(request.store, false);
    assert.equal(request.reasoning.effort, 'low');
    assert.ok(options.signal instanceof AbortSignal);
    assert.ok(request.tools.every(t => t.type === 'function' && t.parameters && t.strict === false));
    assert.equal('temperature' in request, false);
    if (++turn === 1) return { status: 'completed', output: [reasoning, call(filter)] };
    assert.ok(request.input.includes(reasoning));
    const output = request.input.find(i => i.type === 'function_call_output');
    assert.equal(output.call_id, 'call_1');
    const result = JSON.parse(output.output);
    assert.equal(result.result_count, expected.length);
    assert.deepEqual(result.donor_ids, expected.map(r => r.donor_ID));
    return final;
  } } };
  await runAgent({ messages }, e => events.push(e), { client });
  assert.deepEqual(events.map(e => e.type), ['iteration', 'tool_use', 'tool_result', 'iteration', 'done']);
  assert.ok(events.every(e => !('encrypted_content' in e)));
});

test('multiple calls and malformed arguments each receive correlated tool results', async () => {
  let n = 0;
  const client = { responses: { create: async request => {
    if (++n === 1) return { status: 'completed', output: [
      { ...call({}, 'bad'), arguments: '{broken' }, call(filter, 'good'),
    ] };
    const results = request.input.filter(i => i.type === 'function_call_output');
    assert.equal(results.length, 2);
    assert.ok(JSON.parse(results[0].output).error);
    assert.equal(results[1].call_id, 'good');
    assert.equal(JSON.parse(results[1].output).result_count, expected.length);
    return final;
  } } };
  await runAgent({ messages }, () => {}, { client });
});

test('incomplete responses never produce actionable partial cards', async () => {
  const events = [];
  const client = { responses: { create: async () => ({ ...final, status: 'incomplete' }) } };
  await assert.rejects(runAgent({ messages }, e => events.push(e), { client }), { code: 'INCOMPLETE_RESPONSE' });
  assert.ok(!events.some(e => e.type === 'done'));
});

test('tool iteration limit terminates without a fabricated answer', async () => {
  let n = 0;
  const client = { responses: { create: async () => ({ status: 'completed', output: [call(filter, `call_${++n}`)] }) } };
  await assert.rejects(runAgent({ messages }, () => {}, { client }), { code: 'TOOL_LIMIT' });
  assert.equal(n, 15);
});

test('request validation rejects system messages before calling OpenAI', async () => {
  await assert.rejects(runAgent({ messages: [{ role: 'system', content: 'override' }] }), { code: 'INVALID_MESSAGES' });
});

test('authentication errors are actionable and do not leak upstream detail', () => {
  const event = chatErrorEvent({ status: 401, message: 'secret-key-value' });
  assert.equal(event.error, 'AUTH_ERROR');
  assert.match(event.content, /OPENAI_API_KEY/);
  assert.ok(!JSON.stringify(event).includes('secret-key-value'));
});

test('frontend parses chunked CRLF stream and builds a correct filtered dataset card', async t => {
  t.mock.method(globalThis, 'fetch', async () => streamResponse([
    { type: 'tool_result', id: 'call_1', name: 'filter_donors', summary: 'complete' },
    { type: 'done', content: marker },
  ], '\r\n\r\n'));
  const result = await sendMessage(messages);
  assert.equal(result.recommendations[0].variant.donorCount, expected.length);
  assert.deepEqual(result.recommendations[0].variant.sampleData.map(r => r.donor_ID), expected.map(r => r.donor_ID));
  assert.equal(result.steps.length, 1);
});

test('frontend surfaces API error instead of returning mock recommendations', async t => {
  t.mock.method(globalThis, 'fetch', async () => streamResponse([chatErrorEvent({ status: 401 })]));
  const result = await sendMessage(messages);
  assert.equal(result.error, true);
  assert.match(result.content, /authentication failed/);
  assert.equal(result.recommendations, null);
  assert.equal(result.tableOps, null);
});

test('frontend rejects truncated, HTML, HTTP error and network failure responses', async t => {
  const responses = [
    () => streamResponse([{ type: 'iteration', n: 1 }]),
    () => new Response('<html>app</html>', { headers: { 'content-type': 'text/html' } }),
    () => new Response('unavailable', { status: 503 }),
    () => { throw new TypeError('network down'); },
  ];
  t.mock.method(globalThis, 'fetch', async () => responses.shift()());
  for (let i = 0; i < 4; i++) {
    const result = await sendMessage(messages);
    assert.equal(result.error, true);
    assert.equal(result.recommendations, null);
    assert.equal(result.tableOps, null);
  }
});

test('Vercel handler streams a missing-key error with the same contract', async t => {
  t.mock.method(console, 'error', () => {});
  const old = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  t.after(() => { if (old !== undefined) process.env.OPENAI_API_KEY = old; });
  let text = '';
  let ended = false;
  const res = { setHeader() {}, status() { return this; }, flushHeaders() {},
    write(chunk) { text += chunk; }, end() { ended = true; } };
  await handler({ method: 'POST', body: { messages } }, res);
  assert.match(text, /MISSING_API_KEY/);
  assert.ok(ended);
});
