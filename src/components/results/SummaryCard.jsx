import { demoDatasets } from '../../data/demoDatasets';
import { demoModels } from '../../data/demoModels';
import './SummaryCard.css';

function SummaryCard({ result }) {
  const { config, timestamp } = result;

  const selectedDatasets = demoDatasets.filter(d =>
    config.selectedDatasets.includes(d.id)
  );
  const model = demoModels.find(m => m.id === config.selectedModelId);

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="summary-card">
      <h2 className="summary-title">Experiment Summary</h2>
      <p className="summary-timestamp">{formatDate(timestamp)}</p>

      <div className="summary-divider" />

      <div className="summary-field">
        <span className="summary-field-label">Hypothesis</span>
        <p className="summary-field-value">{config.hypothesis}</p>
      </div>

      <div className="summary-field">
        <span className="summary-field-label">Datasets</span>
        <p className="summary-field-value">
          {selectedDatasets.map(d => d.title).join(', ')}
        </p>
      </div>

      <div className="summary-field">
        <span className="summary-field-label">Model</span>
        <p className="summary-field-value">{model ? model.name : '—'}</p>
      </div>
    </div>
  );
}

export default SummaryCard;
