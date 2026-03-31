import { useExperiment } from '../../context/ExperimentContext';
import DatasetList from './DatasetList';
import ModelSelector from './ModelSelector';
import RunButton from './RunButton';
import './SelectionPanel.css';

function SelectionPanel() {
  const { config, runExperiment, addMessage } = useExperiment();

  const handleRunExperiment = () => {
    addMessage({
      id: Date.now().toString(),
      role: 'system',
      content: `Running experiment with ${config.selectedDatasets.length} dataset(s)...`,
      timestamp: new Date(),
    });
    runExperiment();
  };

  const isRunDisabled =
    config.selectedDatasets.length === 0 ||
    !config.selectedModelId;

  return (
    <div className="selection-panel">
      <div className="selection-panel-header">
        <span className="selection-panel-title">Data & Model Selection</span>
      </div>

      <div className="selection-panel-content">
        <DatasetList />
        <ModelSelector />
        <RunButton
          disabled={isRunDisabled}
          onClick={handleRunExperiment}
        />
      </div>
    </div>
  );
}

export default SelectionPanel;
