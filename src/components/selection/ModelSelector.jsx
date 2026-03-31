import { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { demoModels } from '../../data/demoModels';
import Tooltip from '../common/Tooltip';
import './ModelSelector.css';

function ModelSelector() {
  const { config, updateConfig } = useExperiment();
  const [showTooltip, setShowTooltip] = useState(false);

  const selectedModel = demoModels.find(m => m.id === config.selectedModelId);

  return (
    <div className="model-selector-container">
      <div className="model-selector-header">
        <label className="model-selector-label">AI Model</label>
        <div
          className="model-info-icon"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          ⓘ
          {showTooltip && selectedModel && (
            <Tooltip text={selectedModel.description} />
          )}
        </div>
      </div>

      <select
        className="model-selector-dropdown"
        value={config.selectedModelId || ''}
        onChange={(e) => updateConfig({ selectedModelId: e.target.value })}
      >
        <option value="" disabled>Choose a model...</option>
        {demoModels.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModelSelector;
