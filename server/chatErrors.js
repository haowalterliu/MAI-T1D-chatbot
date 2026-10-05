// Send actionable messages, never raw upstream errors or credentials.
export function chatErrorEvent(err) {
  let code = err?.code;
  if (err?.status === 401 || err?.status === 403) code = 'AUTH_ERROR';
  else if (err?.status === 429) code = 'RATE_LIMIT';
  else if (err?.status === 404) code = 'MODEL_UNAVAILABLE';
  else if (['APIUserAbortError', 'APIConnectionTimeoutError', 'TimeoutError', 'AbortError'].includes(err?.name)) code = 'TIMEOUT';
  const messages = {
    MISSING_API_KEY: 'AI is not configured. Set `OPENAI_API_KEY` in the deployment environment and redeploy.',
    AUTH_ERROR: 'OpenAI authentication failed. Check `OPENAI_API_KEY` and project permissions, then redeploy.',
    RATE_LIMIT: 'OpenAI usage or rate limit reached. Check API billing and limits, or try again later.',
    MODEL_UNAVAILABLE: 'The configured OpenAI model is unavailable. Check `OPENAI_MODEL` and project model access.',
    INVALID_MESSAGES: 'The chat request is invalid. Please start a new conversation and try again.',
    TIMEOUT: 'The AI request timed out. Try a narrower query.',
    INCOMPLETE_RESPONSE: 'The AI response was cut short. Try a narrower query; no dataset changes were applied.',
    EMPTY_RESPONSE: 'The AI returned no answer. Please try again.',
    TOOL_LIMIT: 'The query required too many tool calls. Try splitting it into smaller questions.',
  };
  return {
    type: 'error',
    error: messages[code] ? code : 'AI_UNAVAILABLE',
    content: messages[code] || 'The AI service is unavailable. Please try again. No simulated results were substituted.',
  };
}
