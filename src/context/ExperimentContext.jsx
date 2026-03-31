import { createContext, useContext, useState } from 'react';
import { generateMockResults } from '../data/demoResults';

const ExperimentContext = createContext();

const DEMO_HYPOTHESIS = 'Compare beta cell gene expression patterns between pediatric and adult Type 1 Diabetes patients';

const DEMO_MESSAGES = [
  {
    id: 'demo-1',
    role: 'user',
    content: `Recommend datasets to ${DEMO_HYPOTHESIS.toLowerCase()}`,
    timestamp: new Date(),
  },
  {
    id: 'demo-2',
    role: 'assistant',
    content: `Based on your hypothesis to ${DEMO_HYPOTHESIS.toLowerCase()}, I recommend the following datasets:`,
    recommendations: [
      {
        id: 'hpap',
        reason: 'Adult T1D pancreas donors with islet-level RNA-seq — ideal for mature beta cell gene expression profiling',
      },
      {
        id: 'teddy',
        reason: 'Pediatric longitudinal cohort with RNA-seq — enables age-matched comparison of early-onset T1D progression',
      },
    ],
    timestamp: new Date(),
  },
];

const DEMO_CONFIG = {
  hypothesis: DEMO_HYPOTHESIS,
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
        : [...prev.selectedDatasets, datasetId],
    }));
  };

  const removeDataset = (datasetId) => {
    setConfig(prev => ({
      ...prev,
      selectedDatasets: prev.selectedDatasets.filter(id => id !== datasetId),
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
