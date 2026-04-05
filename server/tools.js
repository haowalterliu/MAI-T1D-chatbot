// Demo data — same data used by the frontend, duplicated here for server-side access
// Includes sampleData rows for individual donor-level filtering
//
// HPAP: real 194-donor data imported from the frontend data module (generated from
// HPAP Metadata.xlsx). Other datasets are still mock placeholders.

import { hpapRealData } from '../src/data/hpapRealData.js';

// Per-dataset ID column (HPAP uses the real Excel column name `donor_ID`).
const datasetIdKey = {
  hpap: 'donor_ID',
  teddy: 'donorId',
  immport: 'donorId',
  trialnet: 'donorId',
};

const demoSampleData = {
  hpap: hpapRealData,
  teddy: [
    { donorId: 'TEDDY-001', age: 8, sex: 'M', bmi: 18.2, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '36 mo', autoAntibody: 'GADA', autoAntibodyPositive: 1, cellType: 'Blood samples' },
    { donorId: 'TEDDY-002', age: 5, sex: 'F', bmi: 15.4, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 0', diseaseStatus: 'AAb−', diseaseDuration: '24 mo', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'Blood samples' },
    { donorId: 'TEDDY-003', age: 10, sex: 'M', bmi: 20.1, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '48 mo', autoAntibody: 'GADA, IA-2', autoAntibodyPositive: 2, cellType: 'Blood samples' },
    { donorId: 'TEDDY-004', age: 6, sex: 'F', bmi: 16.3, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 0', diseaseStatus: 'AAb−', diseaseDuration: '30 mo', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'Blood samples' },
    { donorId: 'TEDDY-005', age: 9, sex: 'M', bmi: 19.5, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '42 mo', autoAntibody: 'GADA, IAA', autoAntibodyPositive: 2, cellType: 'Blood samples' },
    { donorId: 'TEDDY-006', age: 4, sex: 'F', bmi: 14.8, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 0', diseaseStatus: 'AAb−', diseaseDuration: '18 mo', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'Blood samples' },
    { donorId: 'TEDDY-007', age: 7, sex: 'M', bmi: 17.6, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '36 mo', autoAntibody: 'IAA', autoAntibodyPositive: 1, cellType: 'Blood samples' },
    { donorId: 'TEDDY-008', age: 10, sex: 'F', bmi: 21.3, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '48 mo', autoAntibody: 'GADA, IA-2, IAA', autoAntibodyPositive: 3, cellType: 'Blood samples' },
    { donorId: 'TEDDY-009', age: 5, sex: 'M', bmi: 15.9, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '24 mo', autoAntibody: 'GADA', autoAntibodyPositive: 1, cellType: 'Blood samples' },
    { donorId: 'TEDDY-010', age: 8, sex: 'F', bmi: 18.7, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 0', diseaseStatus: 'AAb−', diseaseDuration: '36 mo', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'Blood samples' },
    { donorId: 'TEDDY-011', age: 6, sex: 'M', bmi: 16.1, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '30 mo', autoAntibody: 'GADA, ZnT8', autoAntibodyPositive: 2, cellType: 'Blood samples' },
    { donorId: 'TEDDY-012', age: 9, sex: 'F', bmi: 19.8, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '42 mo', autoAntibody: 'IA-2', autoAntibodyPositive: 1, cellType: 'Blood samples' },
  ],
  immport: [
    { donorId: 'IMP-001', age: 12, sex: 'M', bmi: 19.2, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '1 yr', autoAntibody: 'GADA, IA-2', autoAntibodyPositive: 2, cellType: 'PBMCs' },
    { donorId: 'IMP-002', age: 34, sex: 'F', bmi: 24.8, clinicalDiagnosis: 'Control', t1dStage: '—', diseaseStatus: 'AAb−', diseaseDuration: '—', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'PBMCs' },
    { donorId: 'IMP-003', age: 8, sex: 'M', bmi: 17.1, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'GADA', autoAntibodyPositive: 1, cellType: 'PBMCs' },
    { donorId: 'IMP-004', age: 45, sex: 'F', bmi: 28.6, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '15 yrs', autoAntibody: 'GADA, IA-2, ZnT8', autoAntibodyPositive: 3, cellType: 'PBMCs' },
    { donorId: 'IMP-005', age: 22, sex: 'M', bmi: 21.5, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'GADA, IAA', autoAntibodyPositive: 2, cellType: 'PBMCs' },
    { donorId: 'IMP-006', age: 56, sex: 'F', bmi: 32.3, clinicalDiagnosis: 'Control', t1dStage: '—', diseaseStatus: 'AAb−', diseaseDuration: '—', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'PBMCs' },
    { donorId: 'IMP-007', age: 15, sex: 'M', bmi: 20.8, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '3 yrs', autoAntibody: 'GADA, IA-2, IAA, ZnT8', autoAntibodyPositive: 4, cellType: 'PBMCs' },
    { donorId: 'IMP-008', age: 41, sex: 'F', bmi: 26.1, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '8 yrs', autoAntibody: 'GADA, ZnT8', autoAntibodyPositive: 2, cellType: 'PBMCs' },
    { donorId: 'IMP-009', age: 29, sex: 'M', bmi: 23.4, clinicalDiagnosis: 'Control', t1dStage: '—', diseaseStatus: 'AAb−', diseaseDuration: '—', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'PBMCs' },
    { donorId: 'IMP-010', age: 10, sex: 'F', bmi: 18.7, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'IAA', autoAntibodyPositive: 1, cellType: 'PBMCs' },
  ],
  trialnet: [
    { donorId: 'TN-001', age: 9, sex: 'F', bmi: 17.5, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'GADA', autoAntibodyPositive: 1, cellType: 'PBMCs' },
    { donorId: 'TN-002', age: 14, sex: 'M', bmi: 20.3, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'GADA, IA-2', autoAntibodyPositive: 2, cellType: 'PBMCs' },
    { donorId: 'TN-003', age: 32, sex: 'F', bmi: 25.1, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '2 yrs', autoAntibody: 'GADA, IA-2, ZnT8', autoAntibodyPositive: 3, cellType: 'PBMCs' },
    { donorId: 'TN-004', age: 7, sex: 'M', bmi: 16.2, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'IAA', autoAntibodyPositive: 1, cellType: 'PBMCs' },
    { donorId: 'TN-005', age: 42, sex: 'F', bmi: 28.9, clinicalDiagnosis: 'Control', t1dStage: '—', diseaseStatus: 'AAb−', diseaseDuration: '—', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'PBMCs' },
    { donorId: 'TN-006', age: 11, sex: 'M', bmi: 18.8, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '1 yr', autoAntibody: 'GADA, IA-2, IAA, ZnT8', autoAntibodyPositive: 4, cellType: 'PBMCs' },
    { donorId: 'TN-007', age: 25, sex: 'F', bmi: 22.4, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 2', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'GADA, ZnT8', autoAntibodyPositive: 2, cellType: 'PBMCs' },
    { donorId: 'TN-008', age: 38, sex: 'M', bmi: 27.6, clinicalDiagnosis: 'T1D', t1dStage: 'Stage 3', diseaseStatus: 'AAb+', diseaseDuration: '5 yrs', autoAntibody: 'GADA, IA-2', autoAntibodyPositive: 2, cellType: 'PBMCs' },
    { donorId: 'TN-009', age: 5, sex: 'F', bmi: 15.9, clinicalDiagnosis: 'At-risk', t1dStage: 'Stage 1', diseaseStatus: 'AAb+', diseaseDuration: '—', autoAntibody: 'IAA', autoAntibodyPositive: 1, cellType: 'PBMCs' },
    { donorId: 'TN-010', age: 48, sex: 'M', bmi: 30.1, clinicalDiagnosis: 'Control', t1dStage: '—', diseaseStatus: 'AAb−', diseaseDuration: '—', autoAntibody: '—', autoAntibodyPositive: 0, cellType: 'PBMCs' },
  ],
};

const demoDatasets = [
  {
    id: 'hpap',
    title: 'HPAP',
    donorCount: hpapRealData.length,
    donorType: 'Pancreas donors',
    modalities: ['scRNA-seq', 'scATAC-seq', 'Bulk RNA-seq', 'WGS', 'CITE-seq', 'CODEX', 'IMC', 'Flow Cytometry', 'Histology'],
    cellType: 'Islet cells',
    description: 'Human Pancreas Analysis Program — real 194-donor cohort with comprehensive multi-omics (scRNA-seq, scATAC-seq, CITE-seq, CODEX, IMC, WGS, Flow Cytometry, etc.). Best for beta cell and islet-level analyses.',
    keyInfo: [{ label: 'Age', value: '1.08–65.0 yrs' }],
    metadata: {
      ageRange: '1.08–65.0 yrs',
      sex: '101 Male / 92 Female / 1 Unknown',
      bmiRange: '12.0–45.49',
      clinicalDiagnosis: 'ND (94), T2DM (49), T1DM (38), T1DM Medalist, Other, AAb+',
      t1dStage: 'Stage 1–3 (for T1D/AAb+ donors)',
      diseaseStatus: 'T1DM, T2DM, ND, AAb+',
      diseaseDuration: '0–60+ yrs (where applicable)',
      autoAntibody: 'GADA, IA-2, IAA, ZnT8 (individual 0/1 flags)',
      autoAntibodyPositive: 'n_autoantibodies column (0–4)',
    },
  },
  {
    id: 'teddy',
    title: 'TEDDY',
    donorCount: 428,
    donorType: 'Longitudinal pediatric cohort',
    modalities: ['RNA-seq'],
    cellType: 'Blood samples',
    description: 'Longitudinal data ideal for tracking T1D disease progression in children',
    keyInfo: [{ label: 'Age', value: '4–10 yrs' }],
    metadata: {
      ageRange: '4–10 yrs',
      sex: '210M / 218F',
      bmiRange: '14.2–28.6',
      clinicalDiagnosis: 'At-risk / T1D',
      t1dStage: 'Stage 1–2',
      diseaseStatus: 'AAb+ / AAb−',
      diseaseDuration: 'Up to 48 months',
      autoAntibody: 'GADA, IA-2, IAA, ZnT8',
      autoAntibodyPositive: '1–4',
    },
  },
  {
    id: 'immport',
    title: 'ImmPort',
    donorCount: 312,
    donorType: 'Immune study participants',
    modalities: ['CyTOF', 'Flow Cytometry'],
    cellType: 'PBMCs',
    description: 'Large-scale immunology data repository with deep immune phenotyping for T1D studies',
    keyInfo: [{ label: 'Age', value: '5–65 yrs' }],
    metadata: {
      ageRange: '5–65 yrs',
      sex: '168M / 144F',
      bmiRange: '16.2–42.1',
      clinicalDiagnosis: 'T1D, At-risk, Control',
      t1dStage: 'Stage 1–3',
      diseaseStatus: 'AAb+, AAb−',
      diseaseDuration: '0–25 yrs',
      autoAntibody: 'GADA, IA-2, IAA, ZnT8',
      autoAntibodyPositive: '0–4',
    },
  },
  {
    id: 'trialnet',
    title: 'TrialNet',
    donorCount: 245,
    donorType: 'At-risk relatives & new-onset T1D',
    modalities: ['scRNA-seq', 'CyTOF'],
    cellType: 'PBMCs',
    description: 'Longitudinal screening and prevention trial data for T1D-risk relatives',
    keyInfo: [
      { label: 'Age', value: '3–55 yrs' },
      { label: 'Clinical Dx', value: 'At-risk, T1D' },
    ],
    metadata: {
      ageRange: '3–55 yrs',
      sex: '130M / 115F',
      bmiRange: '14.8–38.5',
      clinicalDiagnosis: 'At-risk, T1D, Control',
      t1dStage: 'Stage 1–3',
      diseaseStatus: 'AAb+, AAb−',
      diseaseDuration: '0–10 yrs',
      autoAntibody: 'GADA, IA-2, IAA, ZnT8',
      autoAntibodyPositive: '0–4',
    },
  },
];

const demoModels = [
  {
    id: 'spatial-fm',
    name: 'Spatial FM',
    description: 'Foundation model for spatial transcriptomics. Maps spatial organization of immune cell infiltration and tissue architecture in pancreatic sections.',
    compatibleModalities: ['spatial-transcriptomics', 'CODEX', 'scRNA-seq'],
  },
  {
    id: 'single-cell-fm',
    name: 'Single Cell FM',
    description: 'Foundation model for single-cell multi-omics. Examines cellular heterogeneity and cell-type-specific gene expression patterns, identifying rare beta cell populations.',
    compatibleModalities: ['scRNA-seq', 'RNA-seq', 'CyTOF', 'ATAC-seq'],
  },
  {
    id: 'genomic-fm',
    name: 'Genomic FM',
    description: 'Foundation model for whole-genome analysis. Identifies disease-related genetic variants and polygenic risk scores across donors genome-wide.',
    compatibleModalities: ['WGS', 'RNA-seq', 'ATAC-seq'],
  },
];

// --- Tool Schemas (passed to Claude API) ---

export const toolDefinitions = [
  {
    name: 'search_datasets',
    description: 'Search available T1D research datasets by metadata filters. Returns matching datasets with donor counts, modalities, age ranges, and clinical metadata. Use this whenever you need to recommend or look up datasets.',
    input_schema: {
      type: 'object',
      properties: {
        age_group: {
          type: 'string',
          enum: ['pediatric', 'adult', 'all'],
          description: 'Filter by age group: "pediatric" (<18), "adult" (≥18), or "all"',
        },
        modality: {
          type: 'string',
          description: 'Filter by data modality (e.g., RNA-seq, scRNA-seq, CyTOF, ATAC-seq, Flow Cytometry)',
        },
        clinical_diagnosis: {
          type: 'string',
          description: 'Filter by clinical diagnosis (e.g., T1D, Non-diabetic, At-risk, Control)',
        },
        cell_type: {
          type: 'string',
          description: 'Filter by cell/tissue type (e.g., Islet cells, Blood samples, PBMCs)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_dataset_details',
    description: 'Get full metadata and details for a specific dataset by ID.',
    input_schema: {
      type: 'object',
      properties: {
        dataset_id: {
          type: 'string',
          enum: ['hpap', 'teddy', 'immport', 'trialnet'],
          description: 'The dataset ID to look up',
        },
      },
      required: ['dataset_id'],
    },
  },
  {
    name: 'get_dataset_overlap',
    description: 'Compare two datasets to find overlapping modalities, shared metadata fields, and compatibility for combined analysis.',
    input_schema: {
      type: 'object',
      properties: {
        dataset_a: {
          type: 'string',
          enum: ['hpap', 'teddy', 'immport', 'trialnet'],
          description: 'First dataset ID',
        },
        dataset_b: {
          type: 'string',
          enum: ['hpap', 'teddy', 'immport', 'trialnet'],
          description: 'Second dataset ID',
        },
      },
      required: ['dataset_a', 'dataset_b'],
    },
  },
  {
    name: 'get_compatible_models',
    description: 'Get foundation models compatible with a given data modality or dataset. Use this when recommending which AI model to use.',
    input_schema: {
      type: 'object',
      properties: {
        modality: {
          type: 'string',
          description: 'Data modality to find compatible models for (e.g., RNA-seq, scRNA-seq, CyTOF)',
        },
        dataset_id: {
          type: 'string',
          enum: ['hpap', 'teddy', 'immport', 'trialnet'],
          description: 'Alternatively, provide a dataset ID to find models compatible with its modalities',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_model_details',
    description: 'Get full details about a specific foundation model including capabilities and recommended use cases.',
    input_schema: {
      type: 'object',
      properties: {
        model_id: {
          type: 'string',
          enum: ['spatial-fm', 'single-cell-fm', 'genomic-fm'],
          description: 'The model ID to look up',
        },
      },
      required: ['model_id'],
    },
  },
  {
    name: 'filter_donors',
    description: `Filter individual donor records in a dataset by one or more conditions (combined with AND). Returns donor IDs that match OR do not match the combined filter. Use this when the user wants to keep/remove donors based on specific criteria (e.g., "only BMI > 25", "remove non-diabetic donors", "T1D Stage 1 male donors"). You MUST use this tool before outputting [TABLE_REMOVE:...] markers so you have the exact donor IDs.

IMPORTANT: For compound queries like "T1D stage 1 male donors", pass BOTH conditions in the 'filters' array in a SINGLE call. Do not make multiple separate calls and try to intersect them yourself. Example filters: [{"column":"T1D stage","operator":"==","value":"Stage 1"},{"column":"sex","operator":"==","value":"M"}].

For HPAP, the actual column values are (use these EXACTLY or use the 'contains' operator for partial matches):
- "sex" column values: "Male", "Female", "Unknown" (NOT "M"/"F"). For "male donors" use operator="==" value="Male".
- "T1D stage" column values are long descriptive strings: "No stage", "Stage 1: Two or more autoantibodies, normal glucose metabolism level", "Stage 2: Two or more autoantibodies, dysglycemia (e.g., HbA1c ≥ 5.7%)", "Stage 3: One or more autoantibodies and diagnostic hyperglycemia or T1D diagnosis", "not applicable", "Unknown". For stage filters, ALWAYS use operator="contains" with a short value like "Stage 1", "Stage 2", or "Stage 3" — do not try to match the full string.
- "clinical_diagnosis" column values include: "ND", "ND GAD+", "T1DM", "T1DM Recent", "T1DM DKA", "T1DM/MODY", "T2DM", "T2DM Gastric Bypass", "T2DM Polycystic Ovaries". For "T1D donors" use operator="contains" value="T1DM". For "non-diabetic" use operator="contains" value="ND".
- Stage 1 and Stage 2 are extremely rare in HPAP (only ~3 donors total) — warn the user if they ask to filter on these.

Column names differ per dataset:
- HPAP (real data, 194 donors) uses the original Excel column names, including: donor_ID, clinical_diagnosis, gada, ia_2, iaa, znt8, "T1D stage", n_autoantibodies, disease_duration, age_years, "HbA1C (percentage)", prs_score, score_sans_hla, sex, Donor, DiseaseStatus, BMI, "C-Peptide (ng/ml)", "Diabetes Status", "Family History of Diabetes", "Genetic Ancestry (PancDB)", Ethnicities, and modality flag columns (0/1): scRNA-seq, scATAC-seq, snMultiomics, "CITE-seq Protein", TEA-seq, BCR-seq, TCR-seq, "Bulk RNA-seq", "Bulk ATAC-seq", WGS, "Calcium Imaging", "Flow Cytometry", "Oxygen Consumption", Perifusion, CODEX, IMC, Histology.
- TEDDY / ImmPort / TrialNet (mock data) use: donorId, age, sex, bmi, clinicalDiagnosis, t1dStage, diseaseStatus, diseaseDuration, autoAntibody, autoAntibodyPositive, cellType.`,
    input_schema: {
      type: 'object',
      properties: {
        dataset_id: {
          type: 'string',
          enum: ['hpap', 'teddy', 'immport', 'trialnet'],
          description: 'The dataset to filter',
        },
        filters: {
          type: 'array',
          description: 'Array of filter conditions combined with AND. Use this for compound queries. Each item is a {column, operator, value} object.',
          items: {
            type: 'object',
            properties: {
              column: { type: 'string', description: 'Column name — must exactly match a column in the target dataset.' },
              operator: { type: 'string', enum: ['>', '<', '>=', '<=', '==', '!=', 'contains', 'not_contains'] },
              value: { type: 'string', description: 'Value to compare against (number for numeric columns, string for categorical)' },
            },
            required: ['column', 'operator', 'value'],
          },
        },
        column: {
          type: 'string',
          description: '(Legacy single-filter API) Column name to filter on. Prefer the "filters" array for new code.',
        },
        operator: {
          type: 'string',
          enum: ['>', '<', '>=', '<=', '==', '!=', 'contains', 'not_contains'],
          description: '(Legacy single-filter API) Comparison operator.',
        },
        value: {
          type: 'string',
          description: '(Legacy single-filter API) Value to compare against.',
        },
        return_mode: {
          type: 'string',
          enum: ['matching', 'not_matching'],
          description: '"matching" returns donors that match the combined filter, "not_matching" returns donors that do NOT match (useful for finding donors to remove)',
        },
      },
      required: ['dataset_id'],
    },
  },
  {
    name: 'check_data_sufficiency',
    description: 'Assess whether selected data has sufficient donor counts for a planned analysis. Checks statistical power and group balance.',
    input_schema: {
      type: 'object',
      properties: {
        donor_count: {
          type: 'number',
          description: 'Total number of donors available',
        },
        comparison_groups: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of comparison groups (e.g., ["pediatric", "adult"])',
        },
        analysis_type: {
          type: 'string',
          description: 'Type of analysis planned (e.g., differential_expression, clustering, classification)',
        },
      },
      required: ['donor_count'],
    },
  },
];

// --- Tool Executors ---

function searchDatasets(input) {
  let results = [...demoDatasets];

  if (input.age_group && input.age_group !== 'all') {
    results = results.filter(d => {
      const ageText = d.metadata.ageRange.toLowerCase();
      if (input.age_group === 'pediatric') {
        const numbers = ageText.match(/\d+/g)?.map(Number) || [];
        return numbers.length > 0 && numbers[0] < 18;
      }
      if (input.age_group === 'adult') {
        const numbers = ageText.match(/\d+/g)?.map(Number) || [];
        return numbers.length > 0 && numbers[numbers.length - 1] >= 18;
      }
      return true;
    });
  }

  if (input.modality) {
    const mod = input.modality.toLowerCase();
    results = results.filter(d =>
      d.modalities.some(m => m.toLowerCase().includes(mod))
    );
  }

  if (input.clinical_diagnosis) {
    const dx = input.clinical_diagnosis.toLowerCase();
    results = results.filter(d =>
      d.metadata.clinicalDiagnosis.toLowerCase().includes(dx)
    );
  }

  if (input.cell_type) {
    const ct = input.cell_type.toLowerCase();
    results = results.filter(d => d.cellType.toLowerCase().includes(ct));
  }

  return {
    count: results.length,
    datasets: results.map(d => ({
      id: d.id,
      title: d.title,
      donorCount: d.donorCount,
      donorType: d.donorType,
      modalities: d.modalities,
      cellType: d.cellType,
      ageRange: d.metadata.ageRange,
      clinicalDiagnosis: d.metadata.clinicalDiagnosis,
      description: d.description,
    })),
  };
}

function getDatasetDetails(input) {
  const dataset = demoDatasets.find(d => d.id === input.dataset_id);
  if (!dataset) return { error: `Dataset '${input.dataset_id}' not found` };
  return {
    id: dataset.id,
    title: dataset.title,
    donorCount: dataset.donorCount,
    donorType: dataset.donorType,
    modalities: dataset.modalities,
    cellType: dataset.cellType,
    description: dataset.description,
    metadata: dataset.metadata,
  };
}

function getDatasetOverlap(input) {
  const a = demoDatasets.find(d => d.id === input.dataset_a);
  const b = demoDatasets.find(d => d.id === input.dataset_b);
  if (!a || !b) return { error: 'One or both datasets not found' };

  const sharedModalities = a.modalities.filter(m => b.modalities.includes(m));
  const aAges = a.metadata.ageRange.match(/\d+/g)?.map(Number) || [];
  const bAges = b.metadata.ageRange.match(/\d+/g)?.map(Number) || [];
  const ageOverlap = aAges.length >= 2 && bAges.length >= 2
    ? Math.max(0, Math.min(aAges[1], bAges[1]) - Math.max(aAges[0], bAges[0]))
    : 'unknown';

  return {
    dataset_a: { id: a.id, title: a.title, donorCount: a.donorCount, modalities: a.modalities, ageRange: a.metadata.ageRange },
    dataset_b: { id: b.id, title: b.title, donorCount: b.donorCount, modalities: b.modalities, ageRange: b.metadata.ageRange },
    shared_modalities: sharedModalities,
    age_overlap_years: ageOverlap,
    combined_donors: a.donorCount + b.donorCount,
    compatibility_notes: sharedModalities.length > 0
      ? `Both datasets share ${sharedModalities.join(', ')} modality. Combined analysis is feasible but may require batch effect correction.`
      : `No shared modalities. Cross-dataset analysis would require modality-specific approaches.`,
  };
}

function getCompatibleModels(input) {
  let modalities = [];

  if (input.dataset_id) {
    const dataset = demoDatasets.find(d => d.id === input.dataset_id);
    if (dataset) modalities = dataset.modalities;
  }

  if (input.modality) {
    modalities.push(input.modality);
  }

  if (modalities.length === 0) {
    return {
      models: demoModels.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        compatibleModalities: m.compatibleModalities,
      })),
    };
  }

  const compatible = demoModels.filter(model =>
    modalities.some(mod =>
      model.compatibleModalities.some(cm =>
        cm.toLowerCase().includes(mod.toLowerCase()) ||
        mod.toLowerCase().includes(cm.toLowerCase())
      )
    )
  );

  return {
    queried_modalities: modalities,
    models: compatible.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      compatibleModalities: m.compatibleModalities,
    })),
  };
}

function getModelDetails(input) {
  const model = demoModels.find(m => m.id === input.model_id);
  if (!model) return { error: `Model '${input.model_id}' not found` };
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    compatibleModalities: model.compatibleModalities,
  };
}

function filterDonors(input) {
  const samples = demoSampleData[input.dataset_id];
  if (!samples) return { error: `No sample data for dataset '${input.dataset_id}'` };

  const idKey = datasetIdKey[input.dataset_id] || 'donorId';
  const returnMode = input.return_mode || 'matching';

  // Accept either a filters[] array (new API) or a single column/operator/value
  // triple (legacy API). Normalize both to an array of conditions.
  let conditions = [];
  if (Array.isArray(input.filters) && input.filters.length > 0) {
    conditions = input.filters;
  } else if (input.column && input.operator && input.value != null) {
    conditions = [{ column: input.column, operator: input.operator, value: input.value }];
  } else {
    return { error: 'filter_donors requires either a "filters" array or legacy column/operator/value parameters.' };
  }

  if (samples.length === 0) {
    return { dataset_id: input.dataset_id, total_donors: 0, result_count: 0, donor_ids: [], donors: [] };
  }

  // Validate every column up front so the model gets a clear error on typos.
  const availableCols = Object.keys(samples[0]);
  for (const c of conditions) {
    if (!(c.column in samples[0])) {
      return {
        error: `Column '${c.column}' not found in dataset '${input.dataset_id}'. Available columns: ${availableCols.join(', ')}`,
      };
    }
  }

  // For each condition, pre-compute whether its column is numeric.
  const compiledConds = conditions.map(c => {
    const sampleVal = samples.find(r => r[c.column] != null)?.[c.column];
    const isNumeric = typeof sampleVal === 'number';
    return {
      column: c.column,
      operator: c.operator,
      rawVal: c.value,
      isNumeric,
      compareVal: isNumeric ? parseFloat(c.value) : c.value,
    };
  });

  const evalCondition = (row, cond) => {
    const cellVal = row[cond.column];
    if (cellVal == null) return false;
    if (cond.isNumeric) {
      const num = typeof cellVal === 'number' ? cellVal : parseFloat(cellVal);
      if (isNaN(num)) return false;
      switch (cond.operator) {
        case '>': return num > cond.compareVal;
        case '<': return num < cond.compareVal;
        case '>=': return num >= cond.compareVal;
        case '<=': return num <= cond.compareVal;
        case '==': return num === cond.compareVal;
        case '!=': return num !== cond.compareVal;
        default: return false;
      }
    }
    const str = String(cellVal).toLowerCase();
    const cmp = String(cond.rawVal).toLowerCase();
    switch (cond.operator) {
      case '==': return str === cmp;
      case '!=': return str !== cmp;
      case 'contains': return str.includes(cmp);
      case 'not_contains': return !str.includes(cmp);
      default: return false;
    }
  };

  const matchFn = (row) => compiledConds.every(c => evalCondition(row, c));

  const matching = samples.filter(matchFn);
  const notMatching = samples.filter(r => !matchFn(r));
  const resultSet = returnMode === 'not_matching' ? notMatching : matching;

  const filterDesc = compiledConds.map(c => `${c.column} ${c.operator} ${c.rawVal}`).join(' AND ');

  // Include the filtered columns in each returned donor so the model can cite them.
  const cols = compiledConds.map(c => c.column);
  return {
    dataset_id: input.dataset_id,
    filter: filterDesc,
    return_mode: returnMode,
    total_donors: samples.length,
    result_count: resultSet.length,
    donor_ids: resultSet.map(r => r[idKey]),
    donors: resultSet.map(r => {
      const out = { [idKey]: r[idKey] };
      for (const c of cols) out[c] = r[c];
      return out;
    }),
  };
}

function checkDataSufficiency(input) {
  const count = input.donor_count || 0;
  const groups = input.comparison_groups || [];
  const perGroup = groups.length > 0 ? Math.floor(count / groups.length) : count;

  let assessment, reasoning, suggestions;

  if (perGroup >= 30) {
    assessment = 'sufficient';
    reasoning = `${count} donors across ${groups.length || 1} group(s) (~${perGroup} per group) provides adequate statistical power for most analyses.`;
    suggestions = [];
  } else if (perGroup >= 10) {
    assessment = 'marginal';
    reasoning = `${count} donors across ${groups.length || 1} group(s) (~${perGroup} per group) may be insufficient for robust statistical analysis.`;
    suggestions = [
      'Consider combining with additional datasets to increase sample size',
      'Use methods robust to small sample sizes (e.g., non-parametric tests)',
      'Focus on effect sizes rather than p-values',
    ];
  } else {
    assessment = 'insufficient';
    reasoning = `${count} donors across ${groups.length || 1} group(s) (~${perGroup} per group) is likely insufficient for reliable results.`;
    suggestions = [
      'Combine multiple datasets to increase donor count',
      'Broaden inclusion criteria',
      'Consider this as an exploratory/pilot analysis',
    ];
  }

  return { assessment, reasoning, suggestions, donor_count: count, groups_count: groups.length, per_group: perGroup };
}

// --- Tool Executor Dispatcher ---

export function executeTool(toolName, toolInput) {
  switch (toolName) {
    case 'search_datasets':
      return searchDatasets(toolInput);
    case 'get_dataset_details':
      return getDatasetDetails(toolInput);
    case 'get_dataset_overlap':
      return getDatasetOverlap(toolInput);
    case 'get_compatible_models':
      return getCompatibleModels(toolInput);
    case 'get_model_details':
      return getModelDetails(toolInput);
    case 'filter_donors':
      return filterDonors(toolInput);
    case 'check_data_sufficiency':
      return checkDataSufficiency(toolInput);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
