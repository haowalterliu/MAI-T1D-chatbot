import Tag from '../common/Tag';
import './DatasetDetailModal.css';

function DatasetDetailModal({ dataset, onClose }) {
  // Derive column headers from first row of sampleData
  const columns = dataset.sampleData && dataset.sampleData.length > 0
    ? Object.keys(dataset.sampleData[0])
    : [];

  const formatHeader = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="dataset-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">{dataset.title}</h2>
            <p className="modal-subtitle">{dataset.donorType}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Meta row */}
        <div className="modal-meta-row">
          <span className="modal-meta-item">
            <span className="modal-meta-label">Donors</span>
            <span className="modal-meta-value">{dataset.donorCount}</span>
          </span>
          <span className="modal-meta-item">
            <span className="modal-meta-label">Cell Type</span>
            <span className="modal-meta-value">{dataset.cellType}</span>
          </span>
          <div className="modal-meta-tags">
            {dataset.modalities.map(m => <Tag key={m} label={m} />)}
          </div>
        </div>

        {/* Sample data table */}
        <div className="modal-table-section">
          <p className="modal-table-label">Sample Data ({dataset.sampleData.length} rows shown)</p>
          <div className="modal-table-wrapper">
            <table className="modal-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{formatHeader(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.sampleData.map((row, i) => (
                  <tr key={i}>
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
    </>
  );
}

export default DatasetDetailModal;
