import { demoDatasets } from '../data/demoDatasets';
import { demoModels } from '../data/demoModels';

/**
 * Send a message to the Claude API via the Vite middleware proxy.
 * Reads a Server-Sent Events stream so the caller can observe the agent's
 * tool-use steps live (via `onStep`). Falls back to mock responses if the
 * API is unavailable.
 *
 * @param {Array} messages - conversation history
 * @param {{ onStep?: (step: object, allSteps: object[]) => void }} opts
 */
export async function sendMessage(messages, opts = {}) {
  const { onStep } = opts;
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  try {
    const controller = new AbortController();
    // 90s cap for long multi-tool runs.
    const timeout = setTimeout(() => controller.abort(), 90000);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      clearTimeout(timeout);
      console.warn('API returned non-OK status, falling back to mock');
      return { ...generateMockResponse(lastMessage), steps: [] };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const steps = [];
    let doneEvent = null;
    let errorEvent = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';

      for (const frame of frames) {
        const line = frame.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        let event;
        try {
          event = JSON.parse(line.slice(5).trim());
        } catch {
          continue;
        }
        if (event.type === 'done') {
          doneEvent = event;
        } else if (event.type === 'error') {
          errorEvent = event;
        } else {
          steps.push(event);
          try { onStep?.(event, steps.slice()); } catch (e) { /* ignore UI errors */ }
        }
      }
    }

    clearTimeout(timeout);

    if (errorEvent || !doneEvent || !doneEvent.content) {
      console.warn('API stream ended without a done event, falling back to mock');
      return { ...generateMockResponse(lastMessage), steps };
    }

    return { ...parseResponse(doneEvent.content), steps };
  } catch (err) {
    console.warn('API call failed, falling back to mock:', err.message);
    return { ...generateMockResponse(lastMessage), steps: [] };
  }
}

/**
 * Generate mock responses for prototype demo when API is unavailable.
 */
function generateMockResponse(text) {
  const hypothesis = 'compare beta cell gene expression patterns between pediatric and adult Type 1 Diabetes patients';

  // Dataset recommendation
  if (text.includes('recommend') && text.includes('dataset')) {
    return {
      content: `Based on your hypothesis to ${hypothesis}, I recommend the following datasets:`,
      recommendations: [
        { id: 'hpap', reason: 'HPAP provides comprehensive pancreatic islet cell data from adult donors (18–76 yrs) with RNA-seq, ideal for studying beta cell gene expression in adults.' },
        { id: 'teddy', reason: 'TEDDY offers longitudinal pediatric cohort data (4–10 yrs) with RNA-seq from blood samples, enabling comparison of gene expression patterns in children at risk for T1D.' },
      ],
      modelRecommendations: null,
    };
  }

  // Note: HPAP is real data (194 donors) — we no longer fabricate additional HPAP rows.
  // The AI is instructed not to TABLE_ADD for HPAP in the system prompt.

  // Remove rows from HPAP
  if ((text.includes('remove') || text.includes('exclude')) && (text.includes('non-diabetic') || text.includes('t2d') || text.includes('nd'))) {
    const hpapDataset = demoDatasets.find(d => d.id === 'hpap');
    if (hpapDataset) {
      const idKey = hpapDataset.idKey || 'donor_ID';
      // HPAP real column: clinical_diagnosis — ND = Non-Diabetic, T2DM = Type 2
      const toRemove = hpapDataset.sampleData
        .filter(row => {
          const dx = String(row.clinical_diagnosis || '').toUpperCase();
          return dx.includes('ND') || dx.includes('T2D');
        })
        .map(row => row[idKey]);
      return {
        content: `I've identified ${toRemove.length} non-diabetic and T2D donors in HPAP and marked them for removal, as they are not relevant to a T1D-focused hypothesis.`,
        recommendations: null,
        modelRecommendations: null,
        tableOps: [{ type: 'remove_rows', datasetId: 'hpap', donorIds: toRemove }],
      };
    }
  }

  // BMI filter — "only BMI > 25" or "BMI greater than 25"
  if (text.includes('bmi') && (text.includes('>') || text.includes('greater') || text.includes('大於') || text.includes('only'))) {
    // Find HPAP donors with BMI <= 25 to mark for removal (HPAP uses real Excel column names)
    const hpapDataset = demoDatasets.find(d => d.id === 'hpap');
    if (hpapDataset) {
      const idKey = hpapDataset.idKey || 'donor_ID';
      const toRemove = hpapDataset.sampleData
        .filter(row => typeof row.BMI === 'number' && row.BMI <= 25)
        .map(row => row[idKey]);
      return {
        content: `I've identified ${toRemove.length} donors in HPAP with BMI ≤ 25 and marked them for removal. This will focus your analysis on donors with BMI > 25, which may be relevant for studying metabolic factors in T1D.`,
        recommendations: null,
        modelRecommendations: null,
        tableOps: [{
          type: 'remove_rows',
          datasetId: 'hpap',
          donorIds: toRemove,
        }],
      };
    }
  }

  // Model recommendation
  if (text.includes('recommend') && text.includes('model')) {
    return {
      content: `Based on your hypothesis to ${hypothesis}, I recommend the following model:`,
      recommendations: null,
      modelRecommendations: [{ id: 'single-cell-fm' }],
    };
  }

  // Generic response
  return {
    content: "I can help you explore T1D research datasets and models. Try asking me to recommend datasets or a model for your hypothesis.",
    recommendations: null,
    modelRecommendations: null,
  };
}

/**
 * Parse Claude's response text, extracting markers into structured objects.
 * Supports: [DATASET:id], [MODEL:id], [TABLE_ADD:...], [TABLE_REMOVE:...]
 */
function parseResponse(text) {
  if (!text) return { content: '', recommendations: null, modelRecommendations: null };

  const datasetMarkers = [];
  const modelMarkers = [];
  const tableOps = [];

  // Extract dataset markers. Two forms are supported:
  //   [DATASET:hpap]                                 — plain base dataset
  //   [DATASET:hpap|label=...|filters=col:op:val&...] — filtered variant card
  // The filtered form builds a synthetic sub-dataset (different id, filtered
  // sampleData, custom title) so the UI card shows the actual filter result
  // and the workspace can add it as a separate tab.
  const datasetRegex = /\[DATASET:([^\]]+)\]/g;
  let match;
  let variantCounter = 0;
  while ((match = datasetRegex.exec(text)) !== null) {
    const body = match[1];
    const segments = body.split('|');
    const baseId = segments[0].trim();
    const base = demoDatasets.find(d => d.id === baseId);
    if (!base) continue;

    const beforeMarker = text.substring(0, match.index);
    const reason = extractReason(beforeMarker, base.title);

    if (segments.length === 1) {
      datasetMarkers.push({ id: baseId, reason });
      continue;
    }

    // Parse key=value pairs from the remaining segments.
    const params = {};
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const eq = seg.indexOf('=');
      if (eq === -1) continue;
      params[seg.slice(0, eq).trim()] = seg.slice(eq + 1).trim();
    }

    const label = params.label || base.title;
    const filters = parseFilterSpec(params.filters || '');
    const variant = buildFilteredVariant(base, `${baseId}__v${++variantCounter}`, label, filters);
    datasetMarkers.push({
      id: variant.id,
      baseId,
      reason,
      variant,         // full synthetic dataset object — used by the card
      label,
      filters,
    });
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

  // Extract [TABLE_REMOVE:datasetId:id1,id2,...] markers
  const removeRegex = /\[TABLE_REMOVE:(\w+):([\w,-]+)\]/g;
  while ((match = removeRegex.exec(text)) !== null) {
    const datasetId = match[1];
    const donorIds = match[2].split(',').map(s => s.trim());
    tableOps.push({ type: 'remove_rows', datasetId, donorIds });
  }

  // Extract [TABLE_ADD:datasetId:field1,field2,...] markers
  const addRegex = /\[TABLE_ADD:(\w+):(.*?)\]/g;
  while ((match = addRegex.exec(text)) !== null) {
    const datasetId = match[1];
    const fields = match[2].split(',').map(s => s.trim());
    if (fields.length >= 11) {
      const row = {
        donorId: fields[0],
        age: parseInt(fields[1]) || 0,
        sex: fields[2],
        bmi: parseFloat(fields[3]) || 0,
        clinicalDiagnosis: fields[4],
        t1dStage: fields[5],
        diseaseStatus: fields[6],
        diseaseDuration: fields[7],
        autoAntibody: fields[8],
        autoAntibodyPositive: parseInt(fields[9]) || 0,
        cellType: fields[10],
      };
      // Find existing add op for this dataset or create new one
      let addOp = tableOps.find(op => op.type === 'add_rows' && op.datasetId === datasetId);
      if (!addOp) {
        addOp = { type: 'add_rows', datasetId, rows: [] };
        tableOps.push(addOp);
      }
      addOp.rows.push(row);
    }
  }

  // Clean the text: remove all markers
  let cleanText = text
    .replace(/\[DATASET:[^\]]+\]/g, '')
    .replace(/\[MODEL:[\w-]+\]/g, '')
    .replace(/\[TABLE_REMOVE:\w+:[\w,-]+\]/g, '')
    .replace(/\[TABLE_ADD:\w+:.*?\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    content: cleanText,
    recommendations: datasetMarkers.length > 0 ? datasetMarkers : null,
    modelRecommendations: modelMarkers.length > 0 ? modelMarkers : null,
    tableOps: tableOps.length > 0 ? tableOps : null,
  };
}

// Defensive filters for the optional note-line above each [DATASET:...] marker.
// The system prompt already enforces these rules, but we strip any accidental
// drift (LLM temperature is 0.2, not 0) so the card UI stays consistent.
const COUNT_RECAP_RE = /^(?:\d+|all \d+|a total of \d+)\s+(?:donors?|samples?)\s+(?:with|in|from|matching)\b[^.]*\.?\s*$/i;
const BANNED_PHRASES_RE = /\b(?:ideal for[^.]*|makes it (?:ideal|suitable|perfect)[^.]*|provides comprehensive[^.]*|enables [a-z ]+ studies[^.]*|perfect for[^.]*)\.?/gi;
const NOTE_MAX_LEN = 160;

/**
 * Extract the optional note/caveat line directly above a [DATASET:...] marker.
 *
 * The note is an *optional* sentence per the system prompt: if Claude didn't
 * write one (e.g. the line right above the marker is a bullet, heading, or
 * empty), we return '' and the card renders without a rec-reason paragraph.
 *
 * We only look at the ONE line immediately before the marker, then:
 *   1. Reject bullets, headings, other markers → no note.
 *   2. Reject pure count-recap sentences ("2 donors with Stage 1...") — the
 *      card UI already shows title + count + tags, so recaps are useless.
 *   3. Strip banned rationale phrases ("ideal for", "makes it suitable", ...).
 *   4. Keep only the first sentence.
 *   5. Clamp to NOTE_MAX_LEN characters.
 */
function extractReason(textBefore /*, title */) {
  const lines = textBefore.split('\n');
  // Walk backward to the last non-empty line.
  let raw = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (t) { raw = t; break; }
  }
  if (!raw) return '';

  // Reject structural lines — these are not notes.
  if (raw.startsWith('#')) return '';
  if (raw.startsWith('-') || raw.startsWith('*') || /^\d+\./.test(raw)) return '';
  if (raw.includes('[DATASET:') || raw.includes('[MODEL:')) return '';

  let note = raw
    .replace(/\*\*([^*]+)\*\*/g, '$1') // unwrap bold
    .replace(/^[—–]\s*/, '')            // leading em-dash
    .trim();

  // Strip banned rationale phrases.
  note = note.replace(BANNED_PHRASES_RE, '').replace(/\s+/g, ' ').trim();

  // Reject pure count recaps ("2 donors with Stage 1 and Male.").
  if (COUNT_RECAP_RE.test(note)) return '';

  // Keep only the first sentence (split on ., 。, !, ?).
  const sentMatch = note.match(/^[^.!?。]+[.!?。]?/);
  if (sentMatch) note = sentMatch[0].trim();

  // Clamp length.
  if (note.length > NOTE_MAX_LEN) {
    note = note.slice(0, NOTE_MAX_LEN - 1).trimEnd() + '…';
  }

  return note;
}

/**
 * Parse a filter spec from the DATASET marker payload.
 * Format: "col:op:val&col:op:val"
 * Each filter is a triple separated by ':', filters are joined by '&'.
 * Column names may contain spaces; the split is on the FIRST two colons so
 * values can contain colons too.
 */
function parseFilterSpec(spec) {
  if (!spec) return [];
  return spec.split('&').map(f => {
    const first = f.indexOf(':');
    if (first === -1) return null;
    const second = f.indexOf(':', first + 1);
    if (second === -1) return null;
    return {
      column: f.slice(0, first).trim(),
      operator: f.slice(first + 1, second).trim(),
      value: f.slice(second + 1).trim(),
    };
  }).filter(Boolean);
}

/**
 * Apply a filter spec to a row (AND semantics — all conditions must match).
 */
function rowMatchesFilters(row, filters) {
  for (const f of filters) {
    const cell = row[f.column];
    if (cell == null) return false;
    const isNumeric = typeof cell === 'number';
    if (isNumeric) {
      const num = cell;
      const cmp = parseFloat(f.value);
      switch (f.operator) {
        case '>':  if (!(num > cmp))  return false; break;
        case '<':  if (!(num < cmp))  return false; break;
        case '>=': if (!(num >= cmp)) return false; break;
        case '<=': if (!(num <= cmp)) return false; break;
        case '==': if (num !== cmp)   return false; break;
        case '!=': if (num === cmp)   return false; break;
        default: return false;
      }
    } else {
      const s = String(cell).toLowerCase();
      const v = String(f.value).toLowerCase();
      switch (f.operator) {
        case '==': if (s !== v) return false; break;
        case '!=': if (s === v) return false; break;
        case 'contains':     if (!s.includes(v)) return false; break;
        case 'not_contains': if (s.includes(v))  return false; break;
        default: return false;
      }
    }
  }
  return true;
}

/**
 * Build a synthetic filtered variant dataset from a base dataset.
 * The variant has the same schema (columns, idKey) but filtered sampleData,
 * updated donorCount, and a custom title.
 */
function buildFilteredVariant(base, variantId, label, filters) {
  const filteredRows = filters.length > 0
    ? base.sampleData.filter(row => rowMatchesFilters(row, filters))
    : [...base.sampleData];
  return {
    ...base,
    id: variantId,
    baseId: base.id,
    title: label,
    donorCount: filteredRows.length,
    sampleData: filteredRows,
    isVariant: true,
    variantFilters: filters,
  };
}
