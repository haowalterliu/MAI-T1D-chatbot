import './DatasetDetailModal.css';

const DEFAULT_COLUMNS = [
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

function formatCell(v, key) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  const flagCols = ['scRNA-seq','scATAC-seq','snMultiomics','CITE-seq Protein','TEA-seq','BCR-seq','TCR-seq','Bulk RNA-seq','Bulk ATAC-seq','WGS','Calcium Imaging','Flow Cytometry','Oxygen Consumption','Perifusion','CODEX','IMC','Histology','gada','ia_2','iaa','znt8'];
  if (typeof v === 'number' && flagCols.includes(key) && (v === 0 || v === 1)) {
    return v === 1 ? 'Yes' : 'No';
  }
  return v;
}

function DatasetDetailModal({ dataset, onClose }) {
  const { metadata, sampleData = [] } = dataset;
  const columns = dataset.columns || DEFAULT_COLUMNS;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="dataset-detail-modal">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{dataset.title}</h2>
            <p className="modal-subtitle">{dataset.donorType}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Quick stats */}
        <div className="modal-stats-row">
          <div className="modal-stat">
            <span className="modal-stat-label">Donors</span>
            <span className="modal-stat-value">{dataset.donorCount}</span>
          </div>
          {metadata?.ageRange && (
            <div className="modal-stat">
              <span className="modal-stat-label">Age Range</span>
              <span className="modal-stat-value">{metadata.ageRange}</span>
            </div>
          )}
          <div className="modal-stat">
            <span className="modal-stat-label">Cell / Tissue Type</span>
            <span className="modal-stat-value">{dataset.cellType}</span>
          </div>
        </div>

        <div className="modal-body">
          {/* Sample data table */}
          {sampleData.length > 0 && (
            <div className="modal-section">
              <p className="modal-section-label">({dataset.donorCount} rows shown)</p>
              <div className="modal-table-wrapper">
                <table className="modal-table">
                  <thead>
                    <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, i) => (
                      <tr key={i}>
                        {columns.map(c => <td key={c.key}>{formatCell(row[c.key], c.key)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DatasetDetailModal;
