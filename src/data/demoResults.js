export function generateMockResults(config) {
  return {
    keyFindings: [
      'Model identified 3 major gene expression signatures',
      'Beta cell dysfunction markers show highest correlation',
      'Immune infiltration detected in 67% of samples',
    ],
    visualizations: [
      { type: 'featureImportance', title: 'Top Contributing Features' },
      { type: 'heatmap', title: 'Gene Expression Patterns' },
    ],
    rawData: [
      { gene: 'INS', importance: 0.23, pValue: 0.001 },
      { gene: 'PDX1', importance: 0.19, pValue: 0.003 },
      { gene: 'MAFA', importance: 0.17, pValue: 0.005 },
      { gene: 'NKX6-1', importance: 0.14, pValue: 0.008 },
      { gene: 'GCG', importance: 0.11, pValue: 0.012 },
    ],
  };
}
