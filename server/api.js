import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import { toolDefinitions, executeTool } from './tools.js';

const MAX_TOOL_LOOPS = 5;

export async function handleChatRequest(body) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in .env');
  }

  const client = new Anthropic({ apiKey });

  // Build messages array — filter to only role + content (strip UI metadata)
  let messages = (body.messages || []).map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Tool-use loop: Claude may call tools multiple times before final response
  let loopCount = 0;
  let finalResponse = null;

  while (loopCount < MAX_TOOL_LOOPS) {
    loopCount++;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages,
    });

    // Check if Claude wants to use tools
    if (response.stop_reason === 'tool_use') {
      // Extract all tool_use blocks
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
      const textBlocks = response.content.filter(b => b.type === 'text');

      // Append the full assistant response (including tool_use blocks)
      messages.push({
        role: 'assistant',
        content: response.content,
      });

      // Execute each tool and append results
      const toolResults = toolUseBlocks.map(toolUse => ({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(executeTool(toolUse.name, toolUse.input)),
      }));

      messages.push({
        role: 'user',
        content: toolResults,
      });

      continue; // Loop back to Claude with tool results
    }

    // stop_reason === 'end_turn' — we have the final response
    finalResponse = response;
    break;
  }

  if (!finalResponse) {
    throw new Error('Max tool loops exceeded');
  }

  // Extract text content from the final response
  const textContent = finalResponse.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  return {
    content: textContent,
    usage: finalResponse.usage,
  };
}
