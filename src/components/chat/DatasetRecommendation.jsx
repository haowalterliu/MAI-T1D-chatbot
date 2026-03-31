import { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { demoDatasets } from '../../data/demoDatasets';
import Tag from '../common/Tag';
import DatasetDetailModal from './DatasetDetailModal';
import './DatasetRecommendation.css';

function DatasetRecommendation({ recommendation }) {
  const { config, addDataset } = useExperiment();
  const [showDetail, setShowDetail] = useState(false);
  const dataset = demoDatasets.find(d => d.id === recommendation.id);

  if (!dataset) return null;

  const isAdded = config.selectedDatasets.includes(dataset.id);

  return (
    <>
      <div className="dataset-recommendation">
        <div className="rec-header">
          <h4 className="rec-title">{dataset.title}</h4>
          <button
            className={`rec-add-btn ${isAdded ? 'added' : ''}`}
            onClick={() => !isAdded && addDataset(dataset.id)}
            disabled={isAdded}
          >
            {isAdded ? '✓ Added' : '+ Add'}
          </button>
        </div>

        <p className="rec-donor-count">{dataset.donorCount} donors</p>

        <div className="rec-meta-row">
          {dataset.keyInfo && dataset.keyInfo.map((item, i) => (
            <span key={i} className="rec-key-chip">
              <span className="rec-key-chip-label">{item.label}</span>
              <span className="rec-key-chip-value">{item.value}</span>
            </span>
          ))}
          {dataset.modalities.map(m => <Tag key={m} label={m} />)}
          <Tag label={dataset.cellType} />
        </div>

        {recommendation.reason && (
          <p className="rec-reason">{recommendation.reason}</p>
        )}

        <button
          className="rec-view-details"
          onClick={() => setShowDetail(true)}
        >
          View details
        </button>
      </div>

      {showDetail && (
        <DatasetDetailModal dataset={dataset} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

export default DatasetRecommendation;
