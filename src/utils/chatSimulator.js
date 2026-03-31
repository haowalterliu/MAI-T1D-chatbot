export function generateModelInterpretabilityResponse(hypothesis, datasets, model) {
  const datasetNames = datasets.map(d => d.title).join(', ');

  const content = `Based on your hypothesis "${hypothesis}" and the selected datasets (${datasetNames}), the ${model.name} has identified the following key patterns:

1. Gene Expression Clusters: The model prioritizes 3 major gene expression signatures:
   - Beta cell dysfunction markers (INS, PDX1, MAFA)
   - Immune infiltration signatures (CD8, GZMB, PRF1)
   - Stress response pathways (ATF4, CHOP, XBP1)

2. Feature Importance: Top contributing features to the model's predictions:
   - Age at diagnosis (weight: 0.23)
   - HLA genotype risk score (weight: 0.19)
   - Autoantibody presence (weight: 0.17)

3. Cell Type Specificity: The model shows highest confidence in beta cell and CD8+ T cell populations.

Would you like me to explain any of these findings in more detail, or explore specific gene pathways?`;

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content,
    timestamp: new Date()
  };
}
