import { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import HistoryEntry from '../results/HistoryEntry';
import './AppHeader.css';

function AppHeader({ showHistory = false }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { history, currentResultIndex, viewHistoryResult } = useExperiment();

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-header-logo">MAI</span>
          <span className="app-header-divider" />
          <span className="app-header-subtitle">T1D Research Platform</span>
        </div>

        {showHistory && (
          <button
            className={`history-icon-btn ${isHistoryOpen ? 'active' : ''}`}
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            title="Experiment history"
          >
            <span className="history-icon-label">History</span>
            <span className="history-icon-count">
              {history.length > 0 ? history.length : ''}
            </span>
            📋
          </button>
        )}
      </header>

      {showHistory && isHistoryOpen && (
        <>
          <div
            className="history-dropdown-overlay"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div className="history-dropdown">
            <div className="history-dropdown-header">
              <span className="history-dropdown-title">Experiment History</span>
              <button
                className="history-dropdown-close"
                onClick={() => setIsHistoryOpen(false)}
              >×</button>
            </div>
            <div className="history-dropdown-content">
              {history.length === 0 ? (
                <div className="history-dropdown-empty">No experiment history yet</div>
              ) : (
                history.map((entry, index) => (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    index={index}
                    isActive={index === currentResultIndex}
                    onClick={() => {
                      viewHistoryResult(index);
                      setIsHistoryOpen(false);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default AppHeader;
