import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../context/ExperimentContext';
import { demoDatasets } from '../data/demoDatasets';
import { demoModels } from '../data/demoModels';
import Tag from '../components/common/Tag';
import './OnboardingPage.css';

const HYPOTHESIS_SUGGESTIONS = [
  'How does beta cell dysfunction relate to immune infiltration in T1D progression?',
  'What gene expression signatures distinguish T1D from non-diabetic donors?',
  'How do autoantibody-positive children differ metabolically from controls?',
];

const REASONING_DELAY = 600;

function deriveReasoning(hypothesis, selectedDatasets, selectedModelId) {
  if (!hypothesis.trim()) return null;

  const lower = hypothesis.toLowerCase();
  const isBetaCell = lower.includes('beta') || lower.includes('islet') || lower.includes('insulin');
  const isImmune = lower.includes('immune') || lower.includes('infiltrat') || lower.includes('autoantibod');
  const isLongitudinal = lower.includes('progress') || lower.includes('longitudinal') || lower.includes('children');

  const suggestions = [];

  if (isBetaCell) {
    suggestions.push({ dataset: 'hpap', reason: 'HPAP contains 194 pancreatic donors with islet cell data — ideal for beta cell analysis.' });
  }
  if (isImmune || isLongitudinal) {
    suggestions.push({ dataset: 'teddy', reason: 'TEDDY tracks 428 pediatric donors longitudinally — captures immune progression over time.' });
  }
  if (isImmune) {
    suggestions.push({ dataset: 'itn', reason: 'ITN clinical trial data includes PBMC and CyTOF for immune cell profiling.' });
  }
  if (suggestions.length === 0) {
    suggestions.push({ dataset: 'hpap', reason: 'HPAP is the most comprehensive T1D dataset with multi-omics coverage.' });
  }

  const modelNote = isBetaCell
    ? 'Single Cell Model is recommended to examine cell-type-specific gene expression in your hypothesis.'
    : isImmune
    ? 'Single Cell Model best resolves immune cell heterogeneity relevant to your question.'
    : 'Whole Genome Model provides a broad view of genetic associations across donors.';

  return { suggestions, modelNote };
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { config, updateConfig, addDataset, removeDataset, runExperiment, addMessage } = useExperiment();
  const [reasoning, setReasoning] = useState(null);
  const [reasoningVisible, setReasoningVisible] = useState(false);

  // Debounce reasoning updates as user types
  useEffect(() => {
    setReasoningVisible(false);
    if (!config.hypothesis.trim()) {
      setReasoning(null);
      return;
    }
    const t = setTimeout(() => {
      setReasoning(deriveReasoning(config.hypothesis, config.selectedDatasets, config.selectedModelId));
      setReasoningVisible(true);
    }, REASONING_DELAY);
    return () => clearTimeout(t);
  }, [config.hypothesis]);

  const handleSuggestionClick = (text) => {
    updateConfig({ hypothesis: text });
  };

  const toggleDataset = (id) => {
    if (config.selectedDatasets.includes(id)) {
      removeDataset(id);
    } else {
      addDataset(id);
    }
  };

  const handleRun = async () => {
    addMessage({
      id: Date.now().toString(),
      role: 'system',
      content: `Running experiment with ${config.selectedDatasets.length} dataset(s)...`,
      timestamp: new Date(),
    });
    runExperiment();
    await new Promise(r => setTimeout(r, 600));
    navigate('/results');
  };

  const canRun =
    config.hypothesis.trim().length > 0 &&
    config.selectedDatasets.length > 0 &&
    config.selectedModelId;

  return (
    <div className="onboarding-page">
      {/* Header */}
      <header className="onboarding-header">
        <span className="onboarding-brand">MAI</span>
        <span className="onboarding-brand-divider">|</span>
        <span className="onboarding-brand-sub">T1D Research Platform</span>
      </header>

      {/* Center card */}
      <main className="onboarding-main">
        <div className="onboarding-card">
          <h1 className="onboarding-title">New Experiment</h1>
          <p className="onboarding-subtitle">Describe your research question and let AI guide your setup.</p>

          {/* Hypothesis */}
          <div className="onboarding-section">
            <label className="onboarding-label">Research Hypothesis</label>
            <textarea
              className="onboarding-hypothesis"
              value={config.hypothesis}
              onChange={(e) => updateConfig({ hypothesis: e.target.value })}
              placeholder="Describe your hypothesis or research question..."
              rows={3}
            />

            {/* Suggestions */}
            <div className="onboarding-suggestions">
              <span className="onboarding-suggestions-label">Try:</span>
              {HYPOTHESIS_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="onboarding-suggestion-chip"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.length > 60 ? s.slice(0, 58) + '…' : s}
                </button>
              ))}
            </div>
          </div>

          {/* AI Reasoning */}
          {reasoning && (
            <div className={`onboarding-reasoning ${reasoningVisible ? 'visible' : ''}`}>
              <div className="reasoning-header">
                <span className="reasoning-icon">💭</span>
                <span className="reasoning-title">AI Reasoning</span>
              </div>
              <div className="reasoning-body">
                <p className="reasoning-section-label">Recommended datasets</p>
                <ul className="reasoning-list">
                  {reasoning.suggestions.map((s) => (
                    <li key={s.dataset} className="reasoning-item">
                      <strong>{demoDatasets.find(d => d.id === s.dataset)?.title}</strong> — {s.reason}
                    </li>
                  ))}
                </ul>
                <p className="reasoning-section-label" style={{ marginTop: '10px' }}>Model suggestion</p>
                <p className="reasoning-model-note">{reasoning.modelNote}</p>
              </div>
            </div>
          )}

          {/* Datasets */}
          <div className="onboarding-section">
            <label className="onboarding-label">Select Datasets</label>
            <div className="onboarding-datasets">
              {demoDatasets.map(dataset => {
                const selected = config.selectedDatasets.includes(dataset.id);
                const suggested = reasoning?.suggestions.some(s => s.dataset === dataset.id);
                return (
                  <button
                    key={dataset.id}
                    className={`onboarding-dataset-card ${selected ? 'selected' : ''} ${suggested && !selected ? 'suggested' : ''}`}
                    onClick={() => toggleDataset(dataset.id)}
                  >
                    <div className="od-card-top">
                      <input type="checkbox" checked={selected} readOnly className="od-checkbox" />
                      <span className="od-title">{dataset.title}</span>
                      {suggested && <span className="od-ai-badge">AI pick</span>}
                    </div>
                    <p className="od-meta">{dataset.donorCount} donors · {dataset.cellType}</p>
                    <div className="od-tags">
                      {dataset.modalities.map(m => <Tag key={m} label={m} />)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model */}
          <div className="onboarding-section">
            <label className="onboarding-label">AI Model</label>
            <div className="onboarding-models">
              {demoModels.map(model => {
                const selected = config.selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    className={`onboarding-model-card ${selected ? 'selected' : ''}`}
                    onClick={() => updateConfig({ selectedModelId: model.id })}
                  >
                    <div className="om-radio">
                      <div className={`om-radio-dot ${selected ? 'active' : ''}`} />
                    </div>
                    <div className="om-info">
                      <span className="om-name">{model.name}</span>
                      <span className="om-desc">{model.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            className="onboarding-run-btn"
            disabled={!canRun}
            onClick={handleRun}
          >
            Run Experiment →
          </button>
        </div>
      </main>
    </div>
  );
}

export default OnboardingPage;
