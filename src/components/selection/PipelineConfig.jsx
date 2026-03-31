import { useExperiment } from '../../context/ExperimentContext';
import { demoPipelines } from '../../data/demoPipelines';
import './PipelineConfig.css';

function PipelineConfig() {
  const { config, updateConfig } = useExperiment();

  return (
    <div className="pipeline-config-container">
      <label className="pipeline-config-label">Pipeline Configuration</label>
      <select
        className="pipeline-config-dropdown"
        value={config.pipelineConfigId || ''}
        onChange={(e) => updateConfig({ pipelineConfigId: e.target.value })}
      >
        <option value="">Default pipeline</option>
        {demoPipelines.map(pipeline => (
          <option key={pipeline.id} value={pipeline.id}>
            {pipeline.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PipelineConfig;
