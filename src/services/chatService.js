import { demoDatasets } from '../data/demoDatasets';
import { demoModels } from '../data/demoModels';

/**
 * Send a message to the Claude API via the Vite middleware proxy.
 * Falls back to mock responses if the API is unavailable.
 */
export async function sendMessage(messages) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('API returned non-OK status, falling back to mock');
      return generateMockResponse(lastMessage);
    }

    const data = await response.json();
    if (!data.content || data.error) {
      console.warn('API returned empty/error, falling back to mock');
      return generateMockResponse(lastMessage);
    }
    return parseResponse(data.content);
  } catch (err) {
    console.warn('API call failed, falling back to mock:', err.message);
    return generateMockResponse(lastMessage);
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

  // Add rows to HPAP
  if ((text.includes('add') && text.includes('hpap')) || (text.includes('add') && text.includes('adult'))) {
    return {
      content: `I've identified 3 additional adult donors from the HPAP registry that match your hypothesis criteria. These donors have confirmed T1D diagnosis with available RNA-seq data:`,
      recommendations: null,
      modelRecommendations: null,
      tableOps: [{
        type: 'add_rows',
        datasetId: 'hpap',
        rows: [
          { donorId: 'HPAP-016', age: 35, sex: 'M', bmi: 26.2, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '8 yrs', autoAntibody: 'GADA, IA-2', autoAntibodyPositive: 2, cellType: 'Islet cells' },
          { donorId: 'HPAP-017', age: 58, sex: 'F', bmi: 29.4, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '20 yrs', autoAntibody: 'GADA, IA-2, ZnT8', autoAntibodyPositive: 3, cellType: 'Islet cells' },
          { donorId: 'HPAP-018', age: 22, sex: 'M', bmi: 21.5, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '2 yrs', autoAntibody: 'GADA', autoAntibodyPositive: 1, cellType: 'Islet cells' },
        ],
      }],
    };
  }

  // Remove rows from HPAP
  if ((text.includes('remove') || text.includes('exclude')) && (text.includes('non-diabetic') || text.includes('t2d'))) {
    return {
      content: `I've marked the non-diabetic and T2D donors for removal from HPAP, as they are not relevant to your T1D-focused hypothesis. This will help focus the analysis on T1D-specific gene expression patterns.`,
      recommendations: null,
      modelRecommendations: null,
      tableOps: [{
        type: 'remove_rows',
        datasetId: 'hpap',
        donorIds: ['HPAP-002', 'HPAP-004', 'HPAP-005', 'HPAP-007', 'HPAP-010', 'HPAP-011', 'HPAP-014'],
      }],
    };
  }

  // BMI filter — "only BMI > 25" or "BMI greater than 25"
  if (text.includes('bmi') && (text.includes('>') || text.includes('greater') || text.includes('大於') || text.includes('only'))) {
    // Find HPAP donors with BMI <= 25 to mark for removal
    const hpapDataset = demoDatasets.find(d => d.id === 'hpap');
    if (hpapDataset) {
      const toRemove = hpapDataset.sampleData
        .filter(row => row.bmi <= 25)
        .map(row => row.donorId);
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

  // Extract [DATASET:id] markers
  const datasetRegex = /\[DATASET:(\w+)\]/g;
  let match;
  while ((match = datasetRegex.exec(text)) !== null) {
    const id = match[1];
    const dataset = demoDatasets.find(d => d.id === id);
    if (dataset) {
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
    .replace(/\[DATASET:\w+\]/g, '')
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

/**
 * Extract the reason text for a recommendation from the text before its marker.
 */
function extractReason(textBefore, title) {
  const lines = textBefore.split('\n').filter(l => l.trim());
  if (lines.length === 0) return '';

  let reason = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) break;
    if (line.includes('[DATASET:') || line.includes('[MODEL:')) break;

    reason = line + (reason ? ' ' + reason : '');

    if (line.startsWith('-') || line.startsWith('*') || line.startsWith('**') || /^\d+\./.test(line)) break;
  }

  return reason
    .replace(/\*\*[^*]+\*\*/g, '')
    .replace(/^[-*\d.]+\s*/, '')
    .replace(/[—–]\s*/, '')
    .trim();
}
