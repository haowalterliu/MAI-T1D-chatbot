import { handleChatRequest } from '../server/api.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await handleChatRequest(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({
      error: err.message || 'Internal server error',
      content: 'Sorry, I encountered an error connecting to the AI service. Please try again.',
    });
  }
}
