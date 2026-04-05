import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import { toolDefinitions, executeTool } from './tools.js';

// Tool-use loop cap. Compound queries like "find T1D stage 2 HPAP male donors"
// legitimately require several filter_donors calls plus exploration, so keep
// this generous. Each iteration is one Claude turn + (optionally) tool execution.
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

/**
 * Core agent loop. Calls `emit(event)` for every observable step so the caller
 * can stream events to clients (SSE) or collect them into a steps[] array.
 *
 * Event shapes:
 *   { type: 'iteration', n }
 *   { type: 'reasoning', text }               // text emitted by Claude before a tool call
 *   { type: 'tool_use', id, name, skill, icon, input }
 *   { type: 'tool_result', id, name, skill, summary }
 *   { type: 'done', content, usage, truncated? }
 *   { type: 'error', error, content }
 */
export async function runAgent(body, emit = () => {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in .env');
  }

  const client = new Anthropic({ apiKey });

  let messages = (body.messages || []).map(m => ({
    role: m.role,
    content: m.content,
  }));

  let loopCount = 0;
  let finalResponse = null;
  let lastResponse = null;

  while (loopCount < MAX_TOOL_LOOPS) {
    loopCount++;
    emit({ type: 'iteration', n: loopCount });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages,
    });

    lastResponse = response;

    // Any text blocks produced before a tool call are the model's interim
    // reasoning — surface them as reasoning events.
    const textBlocks = response.content.filter(b => b.type === 'text');
    if (response.stop_reason === 'tool_use') {
      for (const tb of textBlocks) {
        const t = (tb.text || '').trim();
        if (t) emit({ type: 'reasoning', text: t });
      }
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');

      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const toolUse of toolUseBlocks) {
        const meta = TOOL_SKILL[toolUse.name] || { skill: toolUse.name, icon: '🔧' };
        emit({
          type: 'tool_use',
          id: toolUse.id,
          name: toolUse.name,
          skill: meta.skill,
          icon: meta.icon,
          input: toolUse.input,
        });

        const result = executeTool(toolUse.name, toolUse.input);

        emit({
          type: 'tool_result',
          id: toolUse.id,
          name: toolUse.name,
          skill: meta.skill,
          summary: summarizeResult(toolUse.name, result),
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    finalResponse = response;
    break;
  }

  let payload;
  if (!finalResponse) {
    const partialText = (lastResponse?.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();
    const note = 'The assistant reached the tool-use iteration limit while processing this request. Partial results (if any) are shown above. Try narrowing the query or breaking it into smaller steps.';
    payload = {
      content: partialText ? `${partialText}\n\n_${note}_` : note,
      usage: lastResponse?.usage,
      truncated: true,
    };
  } else {
    const textContent = finalResponse.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');
    payload = { content: textContent, usage: finalResponse.usage };
  }

  emit({ type: 'done', ...payload });
  return payload;
}

// Backward-compatible non-streaming entry point.
export async function handleChatRequest(body) {
  return runAgent(body);
}
