import { useState } from 'react';
import Tooltip from '../common/Tooltip';
import './ModelSelector.css';

function ModelSelector({ models, selectedModelId, onChange }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const selectedModel = models.find(m => m.id === selectedModelId);

  return (
    <div className="model-selector-container">
      <div className="model-selector-header">
        <label className="model-selector-label">Select AI Model</label>
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
        value={selectedModelId || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Choose a model...</option>
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModelSelector;
