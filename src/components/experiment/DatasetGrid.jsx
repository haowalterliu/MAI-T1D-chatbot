import DatasetCard from './DatasetCard';
import './DatasetGrid.css';

function DatasetGrid({ datasets, selectedIds, onToggle, onViewDetails }) {
  return (
    <div className="dataset-grid-container">
      <label className="dataset-grid-label">
        Select Data Sources
      </label>
      <div className="dataset-grid">
        {datasets.map(dataset => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            isSelected={selectedIds.includes(dataset.id)}
            onToggle={onToggle}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}

export default DatasetGrid;
