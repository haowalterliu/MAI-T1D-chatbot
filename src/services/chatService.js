import { demoDatasets } from '../data/demoDatasets';
import { demoModels } from '../data/demoModels';

/**
 * Send a message to the Claude API via the Vite middleware proxy.
 * Returns a parsed response matching the existing message shape.
 */
export async function sendMessage(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return parseResponse(data.content);
}

/**
 * Parse Claude's response text, extracting [DATASET:id] and [MODEL:id] markers
 * into structured recommendation objects matching the existing UI components.
 */
function parseResponse(text) {
  if (!text) return { content: '', recommendations: null, modelRecommendations: null };

  const datasetMarkers = [];
  const modelMarkers = [];

  // Extract [DATASET:id] markers with their preceding reason text
  const datasetRegex = /\[DATASET:(\w+)\]/g;
  let match;
  while ((match = datasetRegex.exec(text)) !== null) {
    const id = match[1];
    const dataset = demoDatasets.find(d => d.id === id);
    if (dataset) {
      // Extract reason: look for text between the previous marker (or bold title) and this marker
      const beforeMarker = text.substring(0, match.index);
      const reason = extractReason(beforeMarker, dataset.title);
      datasetMarkers.push({ id, reason });
    }
  }

  // Extract [MODEL:id] markers
  const modelRegex = /\[MODEL:([\w-]+)\]/g;
  while ((match = modelRegex.exec(text)) !== null) {
    const id = match[1];
    const model = demoModels.find(m => m.id === id);
    if (model) {
      modelMarkers.push({ id });
    }
  }

  // Clean the text: remove all markers
  let cleanText = text
    .replace(/\[DATASET:\w+\]/g, '')
    .replace(/\[MODEL:[\w-]+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')  // Collapse excess newlines
    .trim();

  return {
    content: cleanText,
    recommendations: datasetMarkers.length > 0 ? datasetMarkers : null,
    modelRecommendations: modelMarkers.length > 0 ? modelMarkers : null,
  };
}

/**
 * Extract the reason text for a dataset/model recommendation from the text before its marker.
 */
function extractReason(textBefore, title) {
  // Try to find the last paragraph or bullet that mentions this dataset
  const lines = textBefore.split('\n').filter(l => l.trim());
  if (lines.length === 0) return '';

  // Walk backwards to find the reason line(s)
  let reason = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    // Skip empty lines and headers
    if (!line || line.startsWith('#')) break;
    // Stop at previous marker or section break
    if (line.includes('[DATASET:') || line.includes('[MODEL:')) break;

    // Collect this line as part of the reason
    reason = line + (reason ? ' ' + reason : '');

    // If this line starts with a bullet, bold title, or number, it's the start of the reason
    if (line.startsWith('-') || line.startsWith('*') || line.startsWith('**') || /^\d+\./.test(line)) break;
  }

  // Clean up markdown formatting from the reason
  return reason
    .replace(/\*\*[^*]+\*\*/g, '')  // Remove bold markers
    .replace(/^[-*\d.]+\s*/, '')    // Remove bullet/number prefixes
    .replace(/[—–]\s*/, '')         // Remove dashes
    .trim();
}
