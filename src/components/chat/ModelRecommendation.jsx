import { useExperiment } from '../../context/ExperimentContext';
import { demoModels } from '../../data/demoModels';
import './ModelRecommendation.css';

function ModelRecommendation({ recommendation }) {
  const { config, updateConfig } = useExperiment();
  const model = demoModels.find(m => m.id === recommendation.id);

  if (!model) return null;

  const isAdded = config.selectedModelId === model.id;

  return (
    <div className="model-recommendation">
      <div className="model-rec-header">
        <h4 className="model-rec-name">{model.name}</h4>
        <button
          className={`model-rec-btn ${isAdded ? 'added' : ''}`}
          onClick={() => !isAdded && updateConfig({ selectedModelId: model.id })}
          disabled={isAdded}
        >
          {isAdded ? '✓ Added' : '+ Add'}
        </button>
      </div>
      <p className="model-rec-description">{model.description}</p>
    </div>
  );
}

export default ModelRecommendation;
