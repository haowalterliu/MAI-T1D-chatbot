import { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { demoModels } from '../../data/demoModels';
import './ModelSelector.css';

function ModelSelector() {
  const { config, updateConfig } = useExperiment();
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipId, setTooltipId] = useState(null);

  const selectedModel = demoModels.find(m => m.id === config.selectedModelId);

  const handleSelect = (modelId) => {
    updateConfig({ selectedModelId: modelId });
    setIsOpen(false);
  };

  return (
    <div className="model-selector-container">
      <label className="model-selector-label">AI Model</label>

      {/* Trigger — empty state or selected card */}
      <div
        className={`model-trigger ${selectedModel ? 'model-trigger-selected' : 'model-trigger-empty'}`}
        onClick={() => setIsOpen(o => !o)}
      >
        {selectedModel ? (
          <>
            <span className="model-trigger-name">{selectedModel.name}</span>
            <span
              className="model-more-info"
              onMouseEnter={() => setTooltipId('trigger')}
              onMouseLeave={() => setTooltipId(null)}
              onClick={e => e.stopPropagation()}
            >
              ⓘ
              {tooltipId === 'trigger' && (
                <div className="model-tooltip">{selectedModel.description}</div>
              )}
            </span>
            <span className="model-trigger-chevron">{isOpen ? '▲' : '▼'}</span>
          </>
        ) : (
          <span className="model-trigger-placeholder">
            No model selected. Ask AI for recommendations
          </span>
        )}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          <div className="model-dropdown-overlay" onClick={() => setIsOpen(false)} />
          <div className="model-dropdown">
            {demoModels.map(model => {
              const isSelected = config.selectedModelId === model.id;
              return (
                <div
                  key={model.id}
                  className={`model-option ${isSelected ? 'model-option-selected' : ''}`}
                  onClick={() => handleSelect(model.id)}
                >
                  <span className="model-option-radio">
                    {isSelected ? '●' : '○'}
                  </span>
                  <span className="model-option-name">{model.name}</span>
                  <span
                    className="model-more-info"
                    onMouseEnter={() => setTooltipId(model.id)}
                    onMouseLeave={() => setTooltipId(null)}
                    onClick={e => e.stopPropagation()}
                  >
                    ⓘ
                    {tooltipId === model.id && (
                      <div className="model-tooltip">{model.description}</div>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ModelSelector;
