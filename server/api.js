import OpenAI from 'openai';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import { toolDefinitions, executeTool } from './tools.js';

// Tool-use loop cap. Compound queries like "find T1D stage 2 HPAP male donors"
// legitimately require several filter_donors calls plus exploration, so keep
// this generous. Each iteration is one model turn + (optionally) tool execution.
const MAX_TOOL_LOOPS = 15;

// Human-readable "skill" labels for each tool — used by the frontend chain-of-thoughts
// visualization. Kept in this file so the server/stream payload can tell the UI
// which skill is active without the UI having to duplicate the mapping.
const TOOL_SKILL = {
  search_datasets: { skill: 'Dataset Search', icon: '🔍' },
  get_dataset_details: { skill: 'Dataset Lookup', icon: '📄' },
  get_dataset_overlap: { skill: 'Cross-Dataset Comparison', icon: '🔀' },
  get_compatible_models: { skill: 'Model Matching', icon: '🧠' },
  get_model_details: { skill: 'Model Lookup', icon: '📘' },
  filter_donors: { skill: 'Donor-Level Filtering', icon: '🧬' },
  check_data_sufficiency: { skill: 'Feasibility Check', icon: '📊' },
};

function summarizeResult(name, result) {
  if (!result) return 'ok';
  if (result.error) return `error: ${result.error}`;
  switch (name) {
    case 'search_datasets':
      return `${result.count ?? result.datasets?.length ?? 0} datasets found`;
    case 'get_dataset_details':
      return `${result.title}: ${result.donorCount} donors`;
    case 'get_dataset_overlap':
      return `shared modalities: ${(result.shared_modalities || []).join(', ') || 'none'}`;
    case 'get_compatible_models':
      return `${result.models?.length || 0} compatible models`;
    case 'get_model_details':
      return result.name || 'model';
    case 'filter_donors':
      return `${result.result_count}/${result.total_donors} donors matched (${result.filter})`;
    case 'check_data_sufficiency':
      return `${result.assessment} — ${result.donor_count} donors, ${result.groups_count} groups`;
    default:
      return 'ok';
  }
}

// Preserve optional parameters in the existing query tools.
const tools = toolDefinitions.map(({ name, description, input_schema }) => ({
  type: 'function', name, description, parameters: input_schema, strict: false,
}));

function agentError(code) {
  return Object.assign(new Error(code), { code });
}

/** Keep the frontend SSE contract while using OpenAI Responses function calls. */
export async function runAgent(body, emit = () => {}, options = {}) {
  if (!Array.isArray(body?.messages) || body.messages.length === 0 ||
      body.messages.some(m => !m || !['user', 'assistant'].includes(m.role) ||
        typeof m.content !== 'string' || !m.content.trim())) {
    throw agentError('INVALID_MESSAGES');
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!options.client && !apiKey) throw agentError('MISSING_API_KEY');
  const client = options.client || new OpenAI({ apiKey, maxRetries: 0 });
  const input = body.messages.map(({ role, content }) => ({ role, content }));
  // One deadline for the entire tool loop, below the browser's 90-second cap.
  const signal = AbortSignal.timeout(80000);

  for (let n = 1; n <= MAX_TOOL_LOOPS; n++) {
    emit({ type: 'iteration', n });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-6-astra',
      instructions: SYSTEM_PROMPT,
      input,
      tools,
      reasoning: { effort: 'low' },
      max_output_tokens: 4096,
      store: false,
      include: ['reasoning.encrypted_content'],
    }, { signal });

    if (response.status !== 'completed') {
      throw agentError(response.status === 'incomplete' ? 'INCOMPLETE_RESPONSE' : 'AI_RESPONSE_FAILED');
    }
    const output = response.output || [];
    const calls = output.filter(item => item.type === 'function_call');
    if (calls.length === 0) {
      const content = output.filter(item => item.type === 'message')
        .flatMap(item => item.content || [])
        .filter(part => part.type === 'output_text')
        .map(part => part.text).join('\n').trim();
      if (!content) throw agentError('EMPTY_RESPONSE');
      const payload = { content, usage: response.usage };
      emit({ type: 'done', ...payload });
      return payload;
    }

    // Retain all output items, including encrypted reasoning required for
    // stateless tool continuation. Only tool activity is sent to the browser.
    input.push(...output);
    for (const call of calls) {
      const meta = TOOL_SKILL[call.name] || { skill: call.name, icon: '🔧' };
      let args;
      let result;
      try {
        args = JSON.parse(call.arguments);
        if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error();
      } catch {
        result = { error: 'Tool arguments must be a JSON object. Correct the arguments and retry.' };
      }
      emit({ type: 'tool_use', id: call.call_id, name: call.name, ...meta, input: args || {} });
      if (!result) {
        try {
          result = executeTool(call.name, args);
        } catch {
          result = { error: 'Invalid tool parameters. Check the tool schema and retry.' };
        }
      }
      emit({ type: 'tool_result', id: call.call_id, name: call.name, ...meta,
        summary: summarizeResult(call.name, result) });
      input.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result) });
    }
  }
  throw agentError('TOOL_LIMIT');
}

export async function handleChatRequest(body) {
  return runAgent(body);
}
