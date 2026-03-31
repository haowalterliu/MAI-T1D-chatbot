import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import HypothesisInput from '../components/experiment/HypothesisInput';
import DatasetGrid from '../components/experiment/DatasetGrid';
import DataPreviewModal from '../components/experiment/DataPreviewModal';
import ModelSelector from '../components/experiment/ModelSelector';
import RunButton from '../components/experiment/RunButton';
import ChatInterface from '../components/chat/ChatInterface';
import { demoDatasets } from '../data/demoDatasets';
import { demoModels } from '../data/demoModels';
import { generateModelInterpretabilityResponse } from '../utils/chatSimulator';

function ModelInterpretability() {
  const [hypothesis, setHypothesis] = useState('');
  const [selectedDatasetIds, setSelectedDatasetIds] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [previewDatasetId, setPreviewDatasetId] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleToggleDataset = (id) => {
    setSelectedDatasetIds(prev =>
      prev.includes(id)
        ? prev.filter(datasetId => datasetId !== id)
        : [...prev, id]
    );
  };

  const handleViewDetails = (id) => {
    setPreviewDatasetId(id);
  };

  const handleCloseModal = () => {
    setPreviewDatasetId(null);
  };

  const handleRunExperiment = () => {
    const selectedDatasets = demoDatasets.filter(d => selectedDatasetIds.includes(d.id));
    const selectedModel = demoModels.find(m => m.id === selectedModelId);

    const systemMsg = {
      id: Date.now().toString(),
      role: 'system',
      content: `Running experiment with ${selectedDatasets.length} dataset(s) and ${selectedModel.name}...`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, systemMsg]);

    setTimeout(() => {
      const aiResponse = generateModelInterpretabilityResponse(
        hypothesis,
        selectedDatasets,
        selectedModel
      );
      setMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  const handleSendMessage = (text) => {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a demo response. In production, this would be powered by the Claude API with real model interpretability insights.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 500);
  };

  const isRunDisabled = !hypothesis.trim() || selectedDatasetIds.length === 0 || !selectedModelId;
  const previewDataset = demoDatasets.find(d => d.id === previewDatasetId);

  const leftPanel = (
    <>
      <HypothesisInput value={hypothesis} onChange={setHypothesis} />
      <DatasetGrid
        datasets={demoDatasets}
        selectedIds={selectedDatasetIds}
        onToggle={handleToggleDataset}
        onViewDetails={handleViewDetails}
      />
      <ModelSelector
        models={demoModels}
        selectedModelId={selectedModelId}
        onChange={setSelectedModelId}
      />
      <RunButton disabled={isRunDisabled} onClick={handleRunExperiment} />
    </>
  );

  const rightPanel = (
    <ChatInterface
      messages={messages}
      onSendMessage={handleSendMessage}
      placeholder="Configure your experiment on the left, then click 'Run Experiment' to begin..."
    />
  );

  return (
    <>
      <PageLayout leftPanel={leftPanel} rightPanel={rightPanel} />
      {previewDataset && (
        <DataPreviewModal dataset={previewDataset} onClose={handleCloseModal} />
      )}
    </>
  );
}

export default ModelInterpretability;
