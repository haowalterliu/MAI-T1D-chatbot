import { createContext, useContext, useState, useCallback } from 'react';
import { generateMockResults } from '../data/demoResults';
import { demoDatasets } from '../data/demoDatasets';

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
  // Synthetic filtered sub-datasets (e.g. "HPAP — T1D Stage 1 Male") spawned
  // by AI recommendations. Stored as a map: { [variantId]: DatasetObject }.
  const [datasetVariants, setDatasetVariants] = useState({});

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

  // Register a variant dataset (e.g. an AI-filtered sub-cohort) and select it.
  // The variant must already be a complete dataset shape with id, title,
  // sampleData, donorCount, columns, idKey, etc.
  const addDatasetVariant = useCallback((variant) => {
    if (!variant?.id) return;
    setDatasetVariants(prev => ({ ...prev, [variant.id]: variant }));
    setConfig(prev => ({
      ...prev,
      selectedDatasets: prev.selectedDatasets.includes(variant.id)
        ? prev.selectedDatasets
        : [...prev.selectedDatasets, variant.id],
    }));
  }, []);

  // Unified lookup — checks variants first, then falls back to the canonical
  // demoDatasets catalog. All workspace components should use this so they
  // can render AI-spawned filtered sub-datasets transparently.
  const getDataset = useCallback((id) => {
    if (!id) return undefined;
    return datasetVariants[id] || demoDatasets.find(d => d.id === id);
  }, [datasetVariants]);

  // Remove a dataset/variant completely: drop from selection, forget its
  // table state, undo history, committed-data override, and (for variants)
  // its synthetic registration. The corresponding chat card's "+ Add" button
  // auto-resets because it reads from config.selectedDatasets.
  const removeDataset = useCallback((datasetId) => {
    setConfig(prev => ({
      ...prev,
      selectedDatasets: prev.selectedDatasets.filter(id => id !== datasetId),
    }));
    setTableStates(prev => {
      if (!(datasetId in prev)) return prev;
      const next = { ...prev };
      delete next[datasetId];
      return next;
    });
    setTableHistories(prev => {
      if (!(datasetId in prev)) return prev;
      const next = { ...prev };
      delete next[datasetId];
      return next;
    });
    setCommittedData(prev => {
      if (!(datasetId in prev)) return prev;
      const next = { ...prev };
      delete next[datasetId];
      return next;
    });
    setDatasetVariants(prev => {
      if (!(datasetId in prev)) return prev;
      const next = { ...prev };
      delete next[datasetId];
      return next;
    });
  }, []);

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
    addDatasetVariant,
    getDataset,
    datasetVariants,
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
