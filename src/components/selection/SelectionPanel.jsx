import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../../context/ExperimentContext';
import Breadcrumb from '../layout/Breadcrumb';
import HypothesisInput from './HypothesisInput';
import DatasetList from './DatasetList';
import ModelSelector from './ModelSelector';
import RunButton from './RunButton';
import './SelectionPanel.css';

function SelectionPanel() {
  const navigate = useNavigate();
  const { config, updateConfig, runExperiment, addMessage } = useExperiment();

  const handleRunExperiment = async () => {
    addMessage({
      id: Date.now().toString(),
      role: 'system',
      content: `Running experiment with ${config.selectedDatasets.length} dataset(s)...`,
      timestamp: new Date(),
    });

    runExperiment();

    await new Promise(resolve => setTimeout(resolve, 800));
    navigate('/results');
  };

  const isRunDisabled =
    !config.hypothesis.trim() ||
    config.selectedDatasets.length === 0 ||
    !config.selectedModelId;

  return (
    <div className="selection-panel">
      <Breadcrumb currentPage="selection" />

      <div className="selection-panel-content">
        <HypothesisInput
          value={config.hypothesis}
          onChange={(value) => updateConfig({ hypothesis: value })}
        />

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
