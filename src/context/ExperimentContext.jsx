import { createContext, useContext, useState } from 'react';
import { generateMockResults } from '../data/demoResults';

const ExperimentContext = createContext();

const DEMO_MESSAGES = [
  {
    id: 'demo-1',
    role: 'user',
    content: 'recommend datasets for T1D research',
    timestamp: new Date(),
  },
  {
    id: 'demo-2',
    role: 'assistant',
    content: 'Based on your research focus, I recommend the following datasets:',
    recommendations: [
      { id: 'hpap', reason: 'Best for beta cell analysis with comprehensive multi-omics modalities' },
      { id: 'teddy', reason: 'Longitudinal data ideal for tracking T1D disease progression' },
    ],
    timestamp: new Date(),
  },
];

const DEMO_CONFIG = {
  hypothesis: '',
  selectedDatasets: ['hpap', 'teddy'],
  selectedModelId: null,
  pipelineConfigId: null,
};

export function ExperimentProvider({ children }) {
  const [config, setConfig] = useState(DEMO_CONFIG);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [history, setHistory] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(null);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addDataset = (datasetId) => {
    setConfig(prev => ({
      ...prev,
      selectedDatasets: prev.selectedDatasets.includes(datasetId)
        ? prev.selectedDatasets
        : [...prev.selectedDatasets, datasetId]
    }));
  };

  const removeDataset = (datasetId) => {
    setConfig(prev => ({
      ...prev,
      selectedDatasets: prev.selectedDatasets.filter(id => id !== datasetId)
    }));
  };

  const runExperiment = () => {
    const newResult = {
      id: Date.now().toString(),
      timestamp: new Date(),
      config: { ...config, selectedDatasets: [...config.selectedDatasets] },
      results: generateMockResults(config),
    };

    setHistory(prev => {
      const newHistory = [...prev, newResult];
      setCurrentResultIndex(newHistory.length - 1);
      return newHistory;
    });

    return newResult;
  };

  const viewHistoryResult = (index) => {
    setCurrentResultIndex(index);
  };

  const value = {
    config,
    updateConfig,
    addDataset,
    removeDataset,
    messages,
    addMessage,
    history,
    currentResultIndex,
    runExperiment,
    viewHistoryResult,
  };

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  return context;
}
