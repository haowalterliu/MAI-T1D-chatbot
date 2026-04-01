// Demo data — same data used by the frontend, duplicated here for server-side access
const demoDatasets = [
  {
    id: 'hpap',
    title: 'HPAP',
    donorCount: 194,
    donorType: 'Pancreas donors',
    modalities: ['RNA-seq'],
    cellType: 'Islet cells',
    description: 'Best for beta cell analysis with comprehensive multi-omics modalities',
    keyInfo: [{ label: 'Age', value: '18–76 yrs' }],
    metadata: {
      ageRange: '18–76 yrs',
      sex: '103M / 91F',
      bmiRange: '16.0–51.5',
      clinicalDiagnosis: 'T1D, Non-diabetic, T2D',
      t1dStage: 'Stage 1–3',
      diseaseStatus: 'AAb+',
      diseaseDuration: '0–30 yrs',
      autoAntibody: 'GADA, IA-2, IAA, ZnT8',
      autoAntibodyPositive: '4',
    },
  },
  {
    id: 'teddy',
    title: 'TEDDY',
    donorCount: 428,
    donorType: 'Longitudinal pediatric cohort',
    modalities: ['RNA-seq'],
    cellType: 'Blood samples',
    description: 'Longitudinal data ideal for tracking T1D disease progression',
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
    id: 'itn',
    title: 'ITN',
    donorCount: 156,
    donorType: 'Clinical trial participants',
    modalities: ['scRNA-seq', 'CyTOF'],
    cellType: 'PBMCs',
    description: 'Immune profiling data from controlled T1D clinical interventions',
    keyInfo: [
      { label: 'Age', value: '8–45 yrs' },
      { label: 'Clinical Dx', value: 'T1D' },
      { label: 'T1D Stage', value: 'Stage 3' },
    ],
    metadata: {
      ageRange: '8–45 yrs',
      sex: '88M / 68F',
      bmiRange: '18.5–34.2',
      clinicalDiagnosis: 'T1D',
      t1dStage: 'Stage 3',
      diseaseStatus: 'AAb+',
      diseaseDuration: '0–5 yrs',
      autoAntibody: 'GADA, IA-2, ZnT8',
      autoAntibodyPositive: '2–3',
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
          description: 'Filter by data modality (e.g., RNA-seq, scRNA-seq, CyTOF, ATAC-seq)',
        },
        clinical_diagnosis: {
          type: 'string',
          description: 'Filter by clinical diagnosis (e.g., T1D, Non-diabetic, At-risk)',
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
          enum: ['hpap', 'teddy', 'itn'],
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
          enum: ['hpap', 'teddy', 'itn'],
          description: 'First dataset ID',
        },
        dataset_b: {
          type: 'string',
          enum: ['hpap', 'teddy', 'itn'],
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
          description: 'Data modality to find compatible models for (e.g., RNA-seq, scRNA-seq)',
        },
        dataset_id: {
          type: 'string',
          enum: ['hpap', 'teddy', 'itn'],
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
];

// --- Tool Executors ---

function searchDatasets(input) {
  let results = [...demoDatasets];

  if (input.age_group && input.age_group !== 'all') {
    results = results.filter(d => {
      const ageText = d.metadata.ageRange.toLowerCase();
      if (input.age_group === 'pediatric') {
        // Pediatric if max age < 18 or description mentions pediatric/children
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
    // Return all models
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
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
