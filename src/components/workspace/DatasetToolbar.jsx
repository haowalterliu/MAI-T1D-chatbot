import { useState, useRef, useEffect } from 'react';
import './DatasetToolbar.css';

function DatasetToolbar({
  columns, sortConfig, filters, selectedCount,
  canUndo, canRedo, hasChanges,
  onSort, onFilter, onDelete, onUndo, onRedo, onSelectAndUpdate,
}) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="dataset-toolbar">
      <div className="toolbar-left">
        {/* Undo */}
        <button
          className={`toolbar-btn toolbar-icon-btn ${!canUndo ? 'disabled' : ''}`}
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (⌘Z)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1,4 1,10 7,10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>

        {/* Redo */}
        <button
          className={`toolbar-btn toolbar-icon-btn ${!canRedo ? 'disabled' : ''}`}
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (⌘⇧Z)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23,4 23,10 17,10" />
            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>

        <div className="toolbar-divider" />

        {/* Sort */}
        <div className="toolbar-dropdown" ref={sortRef}>
          <button
            className={`toolbar-btn ${sortConfig ? 'active' : ''}`}
            onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M9 18h6" />
            </svg>
            Sort
            {sortConfig && <span className="toolbar-badge">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
          </button>
          {showSortMenu && (
            <div className="toolbar-menu">
              {columns.map(col => (
                <button
                  key={col.key}
                  className={`toolbar-menu-item ${sortConfig?.column === col.key ? 'active' : ''}`}
                  onClick={() => { onSort(col.key); setShowSortMenu(false); }}
                >
                  {col.label}
                  {sortConfig?.column === col.key && (
                    <span className="sort-direction">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="toolbar-dropdown" ref={filterRef}>
          <button
            className={`toolbar-btn ${activeFilterCount > 0 ? 'active' : ''}`}
            onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            Filter
            {activeFilterCount > 0 && <span className="toolbar-badge">{activeFilterCount}</span>}
          </button>
          {showFilterMenu && (
            <div className="toolbar-menu filter-menu">
              {columns.filter(c => ['sex', 'clinicalDiagnosis', 't1dStage', 'diseaseStatus', 'cellType'].includes(c.key)).map(col => (
                <div key={col.key} className="filter-row">
                  <label className="filter-label">{col.label}</label>
                  <input
                    className="filter-input"
                    type="text"
                    placeholder="Type to filter..."
                    value={filters[col.key] || ''}
                    onChange={(e) => onFilter(col.key, e.target.value)}
                  />
                </div>
              ))}
              {activeFilterCount > 0 && (
                <button
                  className="filter-clear"
                  onClick={() => {
                    for (const col of Object.keys(filters)) {
                      onFilter(col, '');
                    }
                  }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete (conditional) */}
        {selectedCount > 0 && (
          <button className="toolbar-btn delete-btn" onClick={onDelete}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
            </svg>
            Delete ({selectedCount})
          </button>
        )}
      </div>

      <div className="toolbar-right">
        <button
          className={`toolbar-update-btn ${hasChanges ? 'active' : ''}`}
          disabled={!hasChanges}
          onClick={onSelectAndUpdate}
        >
          Update Dataset
        </button>
      </div>
    </div>
  );
}

export default DatasetToolbar;
