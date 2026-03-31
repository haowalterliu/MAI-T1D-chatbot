export const demoModels = [
  {
    id: 'whole-genome',
    name: 'Whole Genome Model',
    description: 'Analyzes genome-wide association patterns across donors to identify disease-related genetic variants and polygenic risk scores.',
    compatibleModalities: ['RNA-seq', 'ATAC-seq', 'WGS']
  },
  {
    id: 'single-cell',
    name: 'Single Cell Model',
    description: 'Examines cellular heterogeneity and cell-type-specific gene expression patterns in pancreatic tissue, identifying rare cell populations.',
    compatibleModalities: ['scRNA-seq', 'CyTOF']
  },
  {
    id: 'spatial',
    name: 'Spatial Data Model',
    description: 'Maps spatial organization of immune cell infiltration and tissue architecture in pancreatic sections using imaging-based transcriptomics.',
    compatibleModalities: ['Spatial transcriptomics', 'Imaging']
  }
];
