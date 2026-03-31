import { useExperiment } from '../../context/ExperimentContext';
import DatasetCard from './DatasetCard';
import { demoDatasets } from '../../data/demoDatasets';
import './DatasetList.css';

function DatasetList() {
  const { config, removeDataset } = useExperiment();

  const selectedDatasets = demoDatasets.filter(d =>
    config.selectedDatasets.includes(d.id)
  );

  return (
    <div className="dataset-list-container">
      <label className="dataset-list-label">
        Selected Datasets {selectedDatasets.length > 0 && `(${selectedDatasets.length})`}
      </label>

      {selectedDatasets.length === 0 ? (
        <div className="dataset-list-empty">
          No datasets selected. Ask AI for recommendations →
        </div>
      ) : (
        <div className="dataset-list">
          {selectedDatasets.map(dataset => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onRemove={() => removeDataset(dataset.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DatasetList;
