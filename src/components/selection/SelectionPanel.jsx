import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../../context/ExperimentContext';
import Breadcrumb from '../layout/Breadcrumb';
import DatasetList from './DatasetList';
import ModelSelector from './ModelSelector';
import PipelineConfig from './PipelineConfig';
import RunButton from './RunButton';
import './SelectionPanel.css';

function SelectionPanel() {
  const navigate = useNavigate();
  const { config, runExperiment, addMessage } = useExperiment();

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
    config.selectedDatasets.length === 0 ||
    !config.selectedModelId;

  return (
    <div className="selection-panel">
      <Breadcrumb currentPage="selection" />

      <div className="selection-panel-content">
        {/* Show the hypothesis as a read-only summary */}
        {config.hypothesis && (
          <div className="selection-hypothesis-summary">
            <span className="selection-hypothesis-label">Hypothesis</span>
            <p className="selection-hypothesis-text">{config.hypothesis}</p>
            <button
              className="selection-hypothesis-edit"
              onClick={() => navigate('/')}
            >
              Edit ↗
            </button>
          </div>
        )}

        <DatasetList />

        <ModelSelector />

        <PipelineConfig />

        <RunButton
          disabled={isRunDisabled}
          onClick={handleRunExperiment}
        />
      </div>
    </div>
  );
}

export default SelectionPanel;
