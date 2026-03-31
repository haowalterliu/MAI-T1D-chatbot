import Tag from '../common/Tag';
import './DatasetCard.css';

function DatasetCard({ dataset, onRemove }) {
  return (
    <div className="dataset-card selected">
      <div className="dataset-card-header">
        <input
          type="checkbox"
          checked={true}
          readOnly
          className="dataset-checkbox"
        />
        <h3 className="dataset-title">{dataset.title}</h3>
        <button
          className="dataset-remove-btn"
          onClick={onRemove}
          aria-label="Remove dataset"
        >
          ×
        </button>
      </div>

      <div className="dataset-divider" />

      <div className="dataset-metadata">
        <p className="dataset-meta-item">Donor Type: {dataset.donorType}</p>
        <p className="dataset-meta-item">Cell Type: {dataset.cellType}</p>
      </div>

      <div className="dataset-modalities">
        {dataset.modalities.map(modality => (
          <Tag key={modality} label={modality} />
        ))}
      </div>
    </div>
  );
}

export default DatasetCard;
