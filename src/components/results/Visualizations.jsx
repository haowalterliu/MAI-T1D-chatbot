import './Visualizations.css';

function Visualizations({ charts }) {
  return (
    <div className="visualizations">
      <h3 className="visualizations-title">Visualizations</h3>
      <div className="visualizations-grid">
        {charts.map((chart, index) => (
          <div key={index} className="chart-placeholder">
            <div className="chart-placeholder-inner">
              {chart.type === 'featureImportance' && (
                <FeatureImportanceChart />
              )}
              {chart.type === 'heatmap' && (
                <HeatmapChart />
              )}
            </div>
            <p className="chart-title">{chart.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureImportanceChart() {
  const bars = [
    { label: 'INS', value: 92 },
    { label: 'PDX1', value: 76 },
    { label: 'MAFA', value: 68 },
    { label: 'NKX6-1', value: 56 },
    { label: 'GCG', value: 44 },
  ];

  return (
    <div className="bar-chart">
      {bars.map(bar => (
        <div key={bar.label} className="bar-row">
          <span className="bar-label">{bar.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${bar.value}%` }} />
          </div>
          <span className="bar-value">{bar.value}%</span>
        </div>
      ))}
    </div>
  );
}

function HeatmapChart() {
  const genes = ['INS', 'PDX1', 'MAFA'];
  const samples = ['S1', 'S2', 'S3', 'S4', 'S5'];
  const intensities = [
    [0.9, 0.7, 0.4, 0.8, 0.6],
    [0.6, 0.8, 0.5, 0.7, 0.9],
    [0.4, 0.5, 0.9, 0.3, 0.7],
  ];

  const getColor = (val) => {
    const r = Math.round(255 * (1 - val * 0.6));
    const g = Math.round(255 * (1 - val * 0.3));
    const b = Math.round(255 * (1 - val));
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="heatmap">
      <div className="heatmap-labels-top">
        {samples.map(s => <span key={s} className="heatmap-label">{s}</span>)}
      </div>
      {genes.map((gene, gi) => (
        <div key={gene} className="heatmap-row">
          <span className="heatmap-gene">{gene}</span>
          {intensities[gi].map((val, si) => (
            <div
              key={si}
              className="heatmap-cell"
              style={{ background: getColor(val) }}
              title={`${gene} × ${samples[si]}: ${val.toFixed(2)}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Visualizations;
