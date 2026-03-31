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
      <div
        className="dataset-recommendation"
        onClick={() => setShowDetail(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setShowDetail(true)}
      >
        <div className="recommendation-header">
          <h4 className="recommendation-title">{dataset.title}</h4>
          <button
            className={`recommendation-add-btn ${isAdded ? 'added' : ''}`}
            onClick={(e) => { e.stopPropagation(); if (!isAdded) addDataset(dataset.id); }}
            disabled={isAdded}
          >
            {isAdded ? '✓ Added' : '+ Add'}
          </button>
        </div>

        <p className="recommendation-meta">
          {dataset.donorCount} donors • {dataset.cellType}
        </p>

        <div className="recommendation-modalities">
          {dataset.modalities.map(modality => (
            <Tag key={modality} label={modality} />
          ))}
        </div>

        <p className="recommendation-reason">{recommendation.reason}</p>

        <span className="recommendation-view-details">View details →</span>
      </div>

      {showDetail && (
        <DatasetDetailModal
          dataset={dataset}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

export default DatasetRecommendation;
