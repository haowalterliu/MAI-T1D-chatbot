import { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import HistoryEntry from '../results/HistoryEntry';
import './HistorySidebar.css';

function HistorySidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { history, currentResultIndex, viewHistoryResult } = useExperiment();

  return (
    <>
      <button
        className="history-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        title="View experiment history"
      >
        📋
      </button>

      {isExpanded && (
        <>
          <div
            className="history-sidebar-overlay"
            onClick={() => setIsExpanded(false)}
          />
          <div className="history-sidebar">
            <div className="history-sidebar-header">
              <h3 className="history-sidebar-title">History</h3>
              <button
                className="history-sidebar-close"
                onClick={() => setIsExpanded(false)}
              >
                ×
              </button>
            </div>

            <div className="history-sidebar-content">
              {history.length === 0 ? (
                <div className="history-sidebar-empty">
                  No experiment history yet
                </div>
              ) : (
                history.map((entry, index) => (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    index={index}
                    isActive={index === currentResultIndex}
                    onClick={() => {
                      viewHistoryResult(index);
                      setIsExpanded(false);
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

export default HistorySidebar;
