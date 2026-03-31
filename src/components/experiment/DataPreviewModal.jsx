import './DataPreviewModal.css';

function DataPreviewModal({ dataset, onClose }) {
  if (!dataset) return null;

  const rows = dataset.sampleData;
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{dataset.title} — Data Preview</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map(col => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataPreviewModal;
