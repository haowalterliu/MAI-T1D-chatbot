import './DatasetDetailModal.css';

const TABLE_COLUMNS = ['age', 'sex', 'bmi', 'clinicalDiagnosis', 't1dStage', 'diseaseStatus', 'diseaseDuration', 'autoAntibody', 'autoAntibodyPositive', 'cellType'];
const TABLE_HEADERS = {
  age: 'Age',
  sex: 'Sex',
  bmi: 'BMI',
  clinicalDiagnosis: 'Clinical Diagnosis',
  t1dStage: 'T1D Stage',
  diseaseStatus: 'Disease Status',
  diseaseDuration: 'Disease Duration',
  autoAntibody: 'Auto Antibody',
  autoAntibodyPositive: 'AAb+',
  cellType: 'Cell / Tissue Type',
};

function DatasetDetailModal({ dataset, onClose }) {
  const { metadata, sampleData = [] } = dataset;

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
                    <tr>{TABLE_COLUMNS.map(c => <th key={c}>{TABLE_HEADERS[c]}</th>)}</tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, i) => (
                      <tr key={i}>
                        {TABLE_COLUMNS.map(c => <td key={c}>{row[c] ?? '—'}</td>)}
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
