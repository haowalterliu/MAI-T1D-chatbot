/**
 * Extract filter-like tags from a free-form user question.
 * These are shown as chips on the dataset card so the user can see exactly
 * which filters were picked up from their query.
 *
 * Example:
 *   "Give me T1D stage 1 HPAP male and female donor list"
 *   -> ["T1D stage 1", "male", "female"]
 */
export function extractQueryTags(text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  const tags = [];
  const seen = new Set();

  const add = (label) => {
    const key = label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tags.push(label);
    }
  };

  // --- T1D stage ---
  // "t1d stage 1", "stage 1 t1d", "stage 1", "stage1"
  const stageMatch = lower.match(/\b(?:t1d\s+)?stage\s*([123])\b/);
  if (stageMatch) add(`T1D Stage ${stageMatch[1]}`);

  // --- Sex ---
  if (/\b(male|males|man|men)\b/.test(lower)) add('Male');
  if (/\b(female|females|woman|women)\b/.test(lower)) add('Female');

  // --- Diagnosis ---
  if (/\bnon[-\s]?diabetic\b|\bnd\b/.test(lower)) add('Non-diabetic');
  if (/\bt1dm?\b|\btype\s*1\s*diabet/.test(lower)) add('T1D');
  if (/\bt2dm?\b|\btype\s*2\s*diabet/.test(lower)) add('T2D');
  if (/\baab\+?\b|\bautoantibody\s*positive\b/.test(lower)) add('AAb+');

  // --- Age group ---
  if (/\bpediatric|children|child|kids\b/.test(lower)) add('Pediatric');
  if (/\badult|adults\b/.test(lower)) add('Adult');

  // --- BMI ---
  const bmiMatch = lower.match(/\bbmi\s*(>=|<=|>|<|=)\s*(\d+(?:\.\d+)?)/);
  if (bmiMatch) add(`BMI ${bmiMatch[1]} ${bmiMatch[2]}`);

  // --- Age ---
  const ageMatch = lower.match(/\bage[ds]?\s*(>=|<=|>|<|=)\s*(\d+)/);
  if (ageMatch) add(`Age ${ageMatch[1]} ${ageMatch[2]}`);

  // --- Autoantibody count ---
  const aabMatch = lower.match(/(\d+)\+?\s*autoantibod/);
  if (aabMatch) add(`${aabMatch[1]}+ autoantibodies`);

  // --- Modalities ---
  const modalities = [
    { re: /\bscrna[-\s]?seq\b|\bsingle[-\s]?cell\s*rna\b/, label: 'scRNA-seq' },
    { re: /\bscatac[-\s]?seq\b/, label: 'scATAC-seq' },
    { re: /\bbulk\s*rna[-\s]?seq\b/, label: 'Bulk RNA-seq' },
    { re: /\bbulk\s*atac[-\s]?seq\b/, label: 'Bulk ATAC-seq' },
    { re: /\brna[-\s]?seq\b/, label: 'RNA-seq' },
    { re: /\bwgs\b|\bwhole[-\s]?genome\b/, label: 'WGS' },
    { re: /\bcytof\b/, label: 'CyTOF' },
    { re: /\bcodex\b/, label: 'CODEX' },
    { re: /\bspatial\s*transcriptom/, label: 'Spatial transcriptomics' },
  ];
  for (const { re, label } of modalities) {
    if (re.test(lower)) add(label);
  }

  return tags;
}
