import { useExperiment } from '../../context/ExperimentContext';
import { demoDatasets } from '../../data/demoDatasets';
import Tag from '../common/Tag';
import './DatasetUpdateCard.css';

function DatasetUpdateCard({ op, messageId }) {
  const { tableStates, triggerUpdate, config } = useExperiment();
  const dataset = demoDatasets.find(d => d.id === op.datasetId);
  if (!dataset) return null;

  const isAdded = config.selectedDatasets.includes(op.datasetId);
  const state = tableStates[op.datasetId];
  // Card is "updated" when the dataset has no more pending changes (user clicked update)
  const hasPending = state && (state.deletedRows?.size > 0 || (state.addedRows && state.addedRows.length > 0));
  const isUpdated = isAdded && !hasPending;

  const changeLabel = op.type === 'remove_rows'
    ? `${op.donorIds?.length || 0} rows to remove`
    : `${op.rows?.length || 0} rows to add`;

  const handleUpdate = () => {
    if (!isUpdated) {
      triggerUpdate(op.datasetId);
    }
  };

  return (
    <div className="dataset-update-card">
      <div className="update-card-header">
        <h4 className="update-card-title">{dataset.title}</h4>
        <button
          className={`update-card-btn ${isUpdated ? 'updated' : ''}`}
          onClick={handleUpdate}
          disabled={isUpdated}
        >
          {isUpdated ? '✓ Updated' : 'Update'}
        </button>
      </div>

      <p className="update-card-donor-count">{dataset.donorCount} donors</p>

      <div className="update-card-meta">
        {dataset.keyInfo && dataset.keyInfo.map((item, i) => (
          <span key={i} className="rec-key-chip">
            <span className="rec-key-chip-label">{item.label}</span>
            <span className="rec-key-chip-value">{item.value}</span>
          </span>
        ))}
        {dataset.modalities.map(m => <Tag key={m} label={m} />)}
        <Tag label={dataset.cellType} />
      </div>

      <div className="update-card-change">
        <span className={`change-badge ${op.type === 'remove_rows' ? 'remove' : 'add'}`}>
          {op.type === 'remove_rows' ? '−' : '+'}
        </span>
        <span className="change-label">{changeLabel}</span>
      </div>
    </div>
  );
}

export default DatasetUpdateCard;
