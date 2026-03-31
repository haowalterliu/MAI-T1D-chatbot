import { useState } from 'react';
import Tag from '../common/Tag';
import DatasetDetailModal from '../chat/DatasetDetailModal';
import './DatasetCard.css';

function DatasetCard({ dataset, onRemove }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="dataset-card selected">
        <div className="dataset-card-header">
          <h3 className="dataset-title">{dataset.title}</h3>
          <button className="dataset-remove-btn" onClick={onRemove} aria-label="Remove dataset">×</button>
        </div>

        <p className="dataset-donor-count">{dataset.donorCount} donors</p>

        <div className="dataset-meta-row">
          {dataset.keyInfo && dataset.keyInfo.map((item, i) => (
            <span key={i} className="dataset-key-chip">
              <span className="dataset-key-chip-label">{item.label}</span>
              <span className="dataset-key-chip-value">{item.value}</span>
            </span>
          ))}
          {dataset.modalities.map(m => <Tag key={m} label={m} />)}
          <Tag label={dataset.cellType} />
        </div>

        {dataset.description && (
          <p className="dataset-description">{dataset.description}</p>
        )}

        <button className="dataset-view-details" onClick={() => setShowDetail(true)}>
          View details
        </button>
      </div>

      {showDetail && (
        <DatasetDetailModal dataset={dataset} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

export default DatasetCard;
