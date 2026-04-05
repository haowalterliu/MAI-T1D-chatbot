import { runAgent } from '../server/api.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Stream tool-use events to the client as Server-Sent Events so the
  // chain-of-thoughts UI can update live while Claude is running.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.status(200);
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const emit = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await runAgent(req.body, emit);
  } catch (err) {
    console.error('API Error:', err);
    emit({
      type: 'error',
      error: err.message || 'Internal server error',
      content: 'Sorry, I encountered an error connecting to the AI service. Please try again.',
    });
  }

  res.end();
}
