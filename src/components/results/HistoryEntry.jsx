import './HistoryEntry.css';

function HistoryEntry({ entry, index, isActive, onClick }) {
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <button
      className={`history-entry ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="history-entry-header">
        <span className="history-entry-number">Run #{index + 1}</span>
        {isActive && <span className="history-entry-badge">•</span>}
      </div>
      <p className="history-entry-time">{formatTime(entry.timestamp)}</p>
      <p className="history-entry-datasets">
        {entry.config.selectedDatasets.length} dataset(s)
      </p>
    </button>
  );
}

export default HistoryEntry;
