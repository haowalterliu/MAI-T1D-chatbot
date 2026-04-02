import { createContext, useContext, useState } from 'react';
import { generateMockResults } from '../data/demoResults';

const ExperimentContext = createContext();

const DEMO_HYPOTHESIS = 'Compare beta cell gene expression patterns between pediatric and adult Type 1 Diabetes patients';

const DEMO_MESSAGES = [];

const DEMO_CONFIG = {
  hypothesis: DEMO_HYPOTHESIS,
  selectedDatasets: [],
  selectedModelId: null,
  pipelineConfigId: null,
};

export function ExperimentProvider({ children }) {
  const [config, setConfig] = useState(DEMO_CONFIG);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [history, setHistory] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(null);
  // Pending table operations from AI chat (add/remove rows)
  const [pendingTableOps, setPendingTableOps] = useState([]);
  // Per-dataset table state (persists across layout switches)
  const [tableStates, setTableStates] = useState({});
  const [tableHistories, setTableHistories] = useState({});
  // Per-dataset committed data overrides (after "Update Dataset")
  const [committedData, setCommittedData] = useState({});
  // External update trigger (from chat card "Update" button)
  const [updateTrigger, setUpdateTrigger] = useState(null);

  const triggerUpdate = (datasetId) => {
    setUpdateTrigger({ datasetId, ts: Date.now() });
  };

  const consumeUpdateTrigger = () => {
    const trigger = updateTrigger;
    setUpdateTrigger(null);
    return trigger;
  };

  const addTableOp = (op) => {
    // op: { type: 'add_rows' | 'remove_rows', datasetId, rows: [...] }
    setPendingTableOps(prev => [...prev, op]);
  };

  const consumeTableOps = () => {
    const ops = [...pendingTableOps];
    setPendingTableOps([]);
    return ops;
  };

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
    pendingTableOps,
    addTableOp,
    consumeTableOps,
    tableStates,
    setTableStates,
    tableHistories,
    setTableHistories,
    committedData,
    setCommittedData,
    updateTrigger,
    triggerUpdate,
    consumeUpdateTrigger,
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
