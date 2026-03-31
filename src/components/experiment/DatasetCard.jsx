import Tag from '../common/Tag';
import './DatasetCard.css';

function DatasetCard({ dataset, isSelected, onToggle, onViewDetails }) {
  const handleCardClick = () => {
    if (isSelected) {
      onViewDetails(dataset.id);
    } else {
      onToggle(dataset.id);
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onToggle(dataset.id);
  };

  return (
    <div
      className={`dataset-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      <div className="dataset-card-header">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(dataset.id)}
          onClick={(e) => e.stopPropagation()}
          className="dataset-checkbox"
        />
        <h3 className="dataset-title">{dataset.title}</h3>
        {isSelected && (
          <button
            className="dataset-remove-btn"
            onClick={handleRemoveClick}
            aria-label="Remove"
          >
            ×
          </button>
        )}
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
