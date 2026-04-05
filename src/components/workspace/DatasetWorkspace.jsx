import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { demoDatasets } from '../../data/demoDatasets';
import { demoModels } from '../../data/demoModels';
import DatasetTableHeader from './DatasetTableHeader';
import DatasetToolbar from './DatasetToolbar';
import DatasetTable from './DatasetTable';
import './DatasetWorkspace.css';

const DEFAULT_TABLE_COLUMNS = [
  { key: 'donorId', label: 'Donor ID' },
  { key: 'age', label: 'Age' },
  { key: 'sex', label: 'Sex' },
  { key: 'bmi', label: 'BMI' },
  { key: 'clinicalDiagnosis', label: 'Clinical Diagnosis' },
  { key: 't1dStage', label: 'T1D Stage' },
  { key: 'diseaseStatus', label: 'Disease Status' },
  { key: 'diseaseDuration', label: 'Disease Duration' },
  { key: 'autoAntibody', label: 'Auto Antibody' },
  { key: 'autoAntibodyPositive', label: 'AAb+' },
  { key: 'cellType', label: 'Cell / Tissue Type' },
];

/**
 * Build a list of short, human-readable labels (one per filter) used as
 * separate tag chips on workspace tabs.
 *  [{column:"sex",op:"==",value:"Male"}, {column:"T1D stage",op:"contains",value:"Stage 1"}]
 *   -> ["Male", "Stage 1"]
 */
function filterTagLabels(filters) {
  if (!Array.isArray(filters) || filters.length === 0) return [];
  return filters.map(f => {
    const v = String(f.value ?? '').trim();
    if (f.operator === '==' || f.operator === '===') {
      const lv = v.toLowerCase();
      if (lv === '1' || lv === 'yes' || lv === 'true') return f.column;
      if (lv === '0' || lv === 'no' || lv === 'false') return `No ${f.column}`;
    }
    if (f.operator === '==' || f.operator === 'contains') return v;
    return `${f.column} ${f.operator} ${v}`;
  });
}

function makeInitialState() {
  return {
    selectedRows: new Set(),
    deletedRows: new Set(),
    addedRows: [],
    sortConfig: null,
    filters: {},
  };
}

function cloneState(state) {
  return {
    ...state,
    selectedRows: new Set(state.selectedRows),
    deletedRows: new Set(state.deletedRows),
    addedRows: [...(state.addedRows || [])],
    filters: { ...state.filters },
  };
}

function DatasetWorkspace({ onExperimentStart }) {
  const {
    config, updateConfig, runExperiment, addMessage, pendingTableOps, consumeTableOps,
    tableStates, setTableStates, tableHistories: histories, setTableHistories: setHistories,
    committedData, setCommittedData, updateTrigger, consumeUpdateTrigger,
    getDataset,
  } = useExperiment();
  const selectedDatasets = config.selectedDatasets;

  const [activeTabId, setActiveTabId] = useState(null);

  // Set first tab active when datasets change
  useEffect(() => {
    if (selectedDatasets.length > 0 && !selectedDatasets.includes(activeTabId)) {
      setActiveTabId(selectedDatasets[0]);
    }
    if (selectedDatasets.length === 0) {
      setActiveTabId(null);
    }
  }, [selectedDatasets, activeTabId]);

  // Initialize table state + history for new datasets
  useEffect(() => {
    setTableStates(prev => {
      const next = { ...prev };
      for (const id of selectedDatasets) {
        if (!next[id]) next[id] = makeInitialState();
      }
      return next;
    });
    setHistories(prev => {
      const next = { ...prev };
      for (const id of selectedDatasets) {
        if (!next[id]) next[id] = { past: [], future: [] };
      }
      return next;
    });
  }, [selectedDatasets]);

  // Process pending table operations from AI chat
  useEffect(() => {
    if (pendingTableOps.length === 0) return;
    const ops = consumeTableOps();

    setTableStates(prev => {
      const next = { ...prev };
      for (const op of ops) {
        const state = next[op.datasetId] || makeInitialState();
        const cloned = cloneState(state);

        if (op.type === 'add_rows') {
          cloned.addedRows = [...(cloned.addedRows || []), ...op.rows];
        } else if (op.type === 'remove_rows') {
          const newDeleted = new Set(cloned.deletedRows);
          for (const id of op.donorIds) {
            newDeleted.add(id);
          }
          cloned.deletedRows = newDeleted;
        }

        next[op.datasetId] = cloned;
      }
      return next;
    });

    // Also push to undo history
    setHistories(prev => {
      const next = { ...prev };
      for (const op of ops) {
        const h = next[op.datasetId] || { past: [], future: [] };
        const currentState = tableStates[op.datasetId] || makeInitialState();
        next[op.datasetId] = {
          past: [...h.past, cloneState(currentState)],
          future: [],
        };
      }
      return next;
    });
  }, [pendingTableOps]);

  const activeDataset = useMemo(
    () => getDataset(activeTabId),
    [activeTabId, getDataset]
  );

  // Per-dataset schema — HPAP uses its real Excel column set; others use the default schema
  const activeColumns = activeDataset?.columns || DEFAULT_TABLE_COLUMNS;
  const activeIdKey = activeDataset?.idKey || 'donorId';

  const activeState = tableStates[activeTabId] || makeInitialState();
  const activeHistory = histories[activeTabId] || { past: [], future: [] };

  // Push current state to undo stack, then apply updates
  const updateWithHistory = useCallback((updates) => {
    if (!activeTabId) return;
    setTableStates(prev => {
      const current = prev[activeTabId] || makeInitialState();
      return {
        ...prev,
        [activeTabId]: { ...current, ...updates },
      };
    });
    setHistories(prev => {
      const current = tableStates[activeTabId] || makeInitialState();
      const h = prev[activeTabId] || { past: [], future: [] };
      return {
        ...prev,
        [activeTabId]: {
          past: [...h.past, cloneState(current)],
          future: [], // clear redo on new action
        },
      };
    });
  }, [activeTabId, tableStates]);

  // Update without history (for non-undoable actions like selection, sort, filter)
  const updateActiveState = useCallback((updates) => {
    if (!activeTabId) return;
    setTableStates(prev => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], ...updates },
    }));
  }, [activeTabId]);

  const handleUndo = useCallback(() => {
    if (!activeTabId) return;
    const h = histories[activeTabId];
    if (!h || h.past.length === 0) return;
    const previous = h.past[h.past.length - 1];
    const current = tableStates[activeTabId] || makeInitialState();

    setHistories(prev => ({
      ...prev,
      [activeTabId]: {
        past: h.past.slice(0, -1),
        future: [cloneState(current), ...h.future],
      },
    }));
    setTableStates(prev => ({
      ...prev,
      [activeTabId]: cloneState(previous),
    }));
  }, [activeTabId, histories, tableStates]);

  const handleRedo = useCallback(() => {
    if (!activeTabId) return;
    const h = histories[activeTabId];
    if (!h || h.future.length === 0) return;
    const next = h.future[0];
    const current = tableStates[activeTabId] || makeInitialState();

    setHistories(prev => ({
      ...prev,
      [activeTabId]: {
        past: [...h.past, cloneState(current)],
        future: h.future.slice(1),
      },
    }));
    setTableStates(prev => ({
      ...prev,
      [activeTabId]: cloneState(next),
    }));
  }, [activeTabId, histories, tableStates]);

  // Keyboard shortcut: Cmd+Z / Ctrl+Z for undo, Cmd+Shift+Z / Ctrl+Shift+Z for redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Sort & filter data
  const processedData = useMemo(() => {
    if (!activeDataset) return [];
    const baseData = committedData[activeTabId] || activeDataset.sampleData;
    let data = [...baseData, ...(activeState.addedRows || [])];

    // Apply filters — case-insensitive contains match so users can type
    // partial values (e.g. "stage" matches "Stage 1" / "Stage 2").
    for (const [col, val] of Object.entries(activeState.filters)) {
      if (val) {
        const needle = String(val).toLowerCase().trim();
        if (needle) {
          data = data.filter(row => {
            const cell = row[col];
            if (cell === null || cell === undefined) return false;
            return String(cell).toLowerCase().includes(needle);
          });
        }
      }
    }

    // Apply sort
    if (activeState.sortConfig) {
      const { column, direction } = activeState.sortConfig;
      data.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return data;
  }, [activeDataset, activeTabId, committedData, activeState.addedRows, activeState.sortConfig, activeState.filters]);

  const handleSort = (column) => {
    const current = activeState.sortConfig;
    let direction = 'asc';
    if (current && current.column === column) {
      direction = current.direction === 'asc' ? 'desc' : 'asc';
    }
    updateActiveState({ sortConfig: { column, direction } });
  };

  const handleFilter = (column, value) => {
    updateActiveState({
      filters: { ...activeState.filters, [column]: value || undefined },
    });
  };

  const handleSelectRow = (rowId) => {
    const next = new Set(activeState.selectedRows);
    if (next.has(rowId)) {
      next.delete(rowId);
    } else {
      next.add(rowId);
    }
    updateActiveState({ selectedRows: next });
  };

  const handleSelectAll = () => {
    const selectableIds = processedData
      .filter(row => !activeState.deletedRows.has(row[activeIdKey]))
      .map(row => row[activeIdKey]);
    const allSelected = selectableIds.every(id => activeState.selectedRows.has(id));
    if (allSelected) {
      updateActiveState({ selectedRows: new Set() });
    } else {
      updateActiveState({ selectedRows: new Set(selectableIds) });
    }
  };

  const handleDeleteSelected = () => {
    const next = new Set(activeState.deletedRows);
    for (const id of activeState.selectedRows) {
      next.add(id);
    }
    updateWithHistory({ deletedRows: next, selectedRows: new Set() });
  };

  // Shared update function — can be called for any dataset (toolbar or chat card)
  const performUpdate = useCallback((targetId) => {
    const targetDataset = getDataset(targetId);
    const state = tableStates[targetId];
    if (!targetId || !targetDataset || !state) return;

    const deletedCount = state.deletedRows.size;
    const addedCount = (state.addedRows || []).length;
    if (deletedCount === 0 && addedCount === 0) return;

    // Commit: build new base data with deletions applied and added rows merged
    const idKey = targetDataset.idKey || 'donorId';
    const currentBase = committedData[targetId] || targetDataset.sampleData;
    const survivingOriginal = currentBase.filter(
      row => !state.deletedRows.has(row[idKey])
    );
    const survivingAdded = (state.addedRows || []).filter(
      row => !state.deletedRows.has(row[idKey])
    );
    const newBaseData = [...survivingOriginal, ...survivingAdded];

    // Store committed data in context (survives HMR and layout switches)
    setCommittedData(prev => ({
      ...prev,
      [targetId]: newBaseData,
    }));

    // Reset table state: clear deletedRows, addedRows, and selection
    setTableStates(prev => ({
      ...prev,
      [targetId]: {
        ...prev[targetId],
        deletedRows: new Set(),
        addedRows: [],
        selectedRows: new Set(),
      },
    }));

    // Clear undo/redo history
    setHistories(prev => ({
      ...prev,
      [targetId]: { past: [], future: [] },
    }));

    // Notify in chat
    const parts = [];
    if (deletedCount > 0) parts.push(`removed ${deletedCount} row(s)`);
    if (addedCount > 0) parts.push(`added ${addedCount} row(s)`);
    addMessage({
      id: Date.now().toString(),
      role: 'system',
      content: `Updated ${targetDataset.title}: ${parts.join(', ')}.`,
      timestamp: new Date(),
    });
  }, [tableStates, committedData, addMessage, setCommittedData, setTableStates, setHistories, getDataset]);

  const handleSelectAndUpdate = () => {
    performUpdate(activeTabId);
  };

  // Download the current (processed) table as a CSV file
  const handleDownloadCsv = useCallback(() => {
    if (!activeDataset) return;
    const cols = activeColumns;
    const rows = processedData.filter(r => !activeState.deletedRows.has(r[activeIdKey]));
    const escape = (val) => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'number' && Number.isNaN(val)) return '';
      const s = String(val);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = cols.map(c => escape(c.label)).join(',');
    const body = rows.map(r => cols.map(c => escape(r[c.key])).join(',')).join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (activeDataset.title || 'dataset').replace(/[^a-z0-9-_ ]/gi, '_');
    a.download = `${safeName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeDataset, activeColumns, processedData, activeState.deletedRows, activeIdKey]);

  // Listen for external update triggers (from chat card "Update" button)
  useEffect(() => {
    if (!updateTrigger) return;
    const trigger = consumeUpdateTrigger();
    if (trigger) {
      performUpdate(trigger.datasetId);
    }
  }, [updateTrigger]);

  const handleRunClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRun = () => {
    setShowConfirmDialog(false);
    setExperimentStarted(true);
    if (onExperimentStart) onExperimentStart();
    addMessage({
      id: Date.now().toString(),
      role: 'system',
      content: `Running experiment with ${selectedDatasets.length} dataset(s)...`,
      timestamp: new Date(),
    });
    runExperiment();
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [hoveredModelId, setHoveredModelId] = useState(null);
  const modelDropdownRef = useRef(null);
  const isRunDisabled = selectedDatasets.length === 0 || !config.selectedModelId;

  const selectedModel = demoModels.find(m => m.id === config.selectedModelId);

  const handleSelectModel = (modelId) => {
    updateConfig({ selectedModelId: modelId });
    setShowModelDropdown(false);
  };
  // Close model dropdown on outside click
  useEffect(() => {
    if (!showModelDropdown) return;
    const handleClick = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setShowModelDropdown(false);
        setHoveredModelId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showModelDropdown]);

  const hasPendingUpdates = activeState.deletedRows.size > 0 || (activeState.addedRows && activeState.addedRows.length > 0);

  // Empty state
  if (selectedDatasets.length === 0) {
    return (
      <div className="dataset-workspace">
        <div className="workspace-empty">
          <div className="workspace-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 3v18" />
            </svg>
          </div>
          <p className="workspace-empty-text">No datasets selected</p>
          <p className="workspace-empty-hint">Ask the AI assistant to recommend datasets for your hypothesis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dataset-workspace">
      <div className="workspace-header">
        <div className="workspace-tabs">
          {selectedDatasets.map(id => {
            const ds = getDataset(id);
            if (!ds) return null;
            const state = tableStates[id];
            const hasPendingChanges = state && (state.deletedRows.size > 0 || (state.addedRows && state.addedRows.length > 0));
            // For variant datasets, show the base name + a compact filter
            // label pill so multiple filtered sub-cohorts of the same base
            // are distinguishable at a glance (e.g. "HPAP  [Stage 1 · Male]").
            const base = ds.isVariant ? demoDatasets.find(d => d.id === ds.baseId) : null;
            const baseName = base ? base.title.split(':')[0].trim() : ds.title;
            const variantTags = ds.isVariant ? filterTagLabels(ds.variantFilters) : [];
            return (
              <button
                key={id}
                className={`workspace-tab ${activeTabId === id ? 'active' : ''}`}
                onClick={() => setActiveTabId(id)}
              >
                <span className="workspace-tab-name">{baseName}</span>
                {variantTags.map((t, i) => (
                  <span key={i} className="workspace-tab-variant">{t}</span>
                ))}
                {hasPendingChanges && <span className="tab-update-dot" />}
              </button>
            );
          })}
        </div>
        <div className="workspace-header-actions">
          <div className="model-dropdown-wrapper" ref={modelDropdownRef}>
            <button
              className="model-dropdown-trigger"
              onClick={() => setShowModelDropdown(prev => !prev)}
            >
              {selectedModel ? selectedModel.name : 'Select Model'}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5l3 3 3-3" />
              </svg>
            </button>
            {showModelDropdown && (
              <div className="model-dropdown-menu">
                {demoModels.map(model => (
                  <div
                    key={model.id}
                    className={`model-dropdown-item ${config.selectedModelId === model.id ? 'selected' : ''}`}
                    onClick={() => handleSelectModel(model.id)}
                    onMouseEnter={() => setHoveredModelId(model.id)}
                    onMouseLeave={() => setHoveredModelId(null)}
                  >
                    <span className="model-item-name">{model.name}</span>
                    {config.selectedModelId === model.id && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7l3 3 5-6" />
                      </svg>
                    )}
                    {hoveredModelId === model.id && (
                      <div className="model-tooltip">{model.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className={`workspace-run-btn ${isRunDisabled ? 'disabled' : ''}`}
            disabled={isRunDisabled}
            onClick={handleRunClick}
          >
            Run Experiment
          </button>
        </div>
      </div>

      {activeDataset && (
        <div className="workspace-body">
          <DatasetTableHeader dataset={activeDataset} />
          <DatasetToolbar
            columns={activeColumns}
            sortConfig={activeState.sortConfig}
            filters={activeState.filters}
            selectedCount={activeState.selectedRows.size}
            canUndo={activeHistory.past.length > 0}
            canRedo={activeHistory.future.length > 0}
            hasChanges={hasPendingUpdates}
            onSort={handleSort}
            onFilter={handleFilter}
            onDelete={handleDeleteSelected}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSelectAndUpdate={handleSelectAndUpdate}
            onDownloadCsv={handleDownloadCsv}
          />
          <DatasetTable
            data={processedData}
            columns={activeColumns}
            idKey={activeIdKey}
            selectedRows={activeState.selectedRows}
            deletedRows={activeState.deletedRows}
            addedRowIds={new Set((activeState.addedRows || []).map(r => r[activeIdKey]))}
            sortConfig={activeState.sortConfig}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
          />
        </div>
      )}
      {showConfirmDialog && (
        <div className="confirm-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="confirm-title">Run Experiment</h3>
            <p className="confirm-text">
              Run experiment with {selectedDatasets.length} dataset(s)
              {config.selectedModelId ? ` using ${config.selectedModelId}` : ''}?
            </p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmRun}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatasetWorkspace;
