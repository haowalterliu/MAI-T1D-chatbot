export const demoDatasets = [
  {
    id: 'hpap',
    title: 'HPAP',
    donorType: 'Pancreas donors',
    cellType: 'Islet cells',
    modalities: ['RNA-seq', 'ATAC-seq', 'scRNA-seq'],
    donorCount: 194,
    sampleData: [
      { donorId: 'HPAP-001', age: 45, bmi: 28.3, modality: 'RNA-seq', diseaseStatus: 'T1D' },
      { donorId: 'HPAP-002', age: 52, bmi: 31.1, modality: 'ATAC-seq', diseaseStatus: 'Non-diabetic' },
      { donorId: 'HPAP-003', age: 38, bmi: 24.7, modality: 'scRNA-seq', diseaseStatus: 'T1D' },
      { donorId: 'HPAP-004', age: 61, bmi: 29.8, modality: 'RNA-seq', diseaseStatus: 'T2D' },
      { donorId: 'HPAP-005', age: 29, bmi: 22.4, modality: 'ATAC-seq', diseaseStatus: 'Non-diabetic' },
      { donorId: 'HPAP-006', age: 47, bmi: 33.2, modality: 'scRNA-seq', diseaseStatus: 'T1D' },
      { donorId: 'HPAP-007', age: 55, bmi: 27.6, modality: 'RNA-seq', diseaseStatus: 'Non-diabetic' },
      { donorId: 'HPAP-008', age: 42, bmi: 30.5, modality: 'ATAC-seq', diseaseStatus: 'T1D' },
    ]
  },
  {
    id: 'teddy',
    title: 'TEDDY',
    donorType: 'Longitudinal pediatric cohort',
    cellType: 'Blood samples',
    modalities: ['RNA-seq', 'Metabolomics'],
    donorCount: 428,
    sampleData: [
      { donorId: 'TEDDY-101', age: 8, followUpMonths: 36, modality: 'RNA-seq', autoantibodyStatus: 'Positive' },
      { donorId: 'TEDDY-102', age: 5, followUpMonths: 24, modality: 'Metabolomics', autoantibodyStatus: 'Negative' },
      { donorId: 'TEDDY-103', age: 10, followUpMonths: 48, modality: 'RNA-seq', autoantibodyStatus: 'Positive' },
      { donorId: 'TEDDY-104', age: 6, followUpMonths: 30, modality: 'Metabolomics', autoantibodyStatus: 'Negative' },
      { donorId: 'TEDDY-105', age: 9, followUpMonths: 42, modality: 'RNA-seq', autoantibodyStatus: 'Positive' },
    ]
  },
  {
    id: 'itn',
    title: 'ITN',
    donorType: 'Clinical trial participants',
    cellType: 'PBMCs',
    modalities: ['scRNA-seq', 'CyTOF'],
    donorCount: 156,
    sampleData: [
      { donorId: 'ITN-001', age: 34, trialArm: 'Treatment', modality: 'scRNA-seq', responseStatus: 'Responder' },
      { donorId: 'ITN-002', age: 28, trialArm: 'Placebo', modality: 'CyTOF', responseStatus: 'Non-responder' },
      { donorId: 'ITN-003', age: 41, trialArm: 'Treatment', modality: 'scRNA-seq', responseStatus: 'Responder' },
      { donorId: 'ITN-004', age: 37, trialArm: 'Placebo', modality: 'CyTOF', responseStatus: 'Non-responder' },
      { donorId: 'ITN-005', age: 45, trialArm: 'Treatment', modality: 'scRNA-seq', responseStatus: 'Partial responder' },
    ]
  }
];
