import './DatasetTableHeader.css';

function DatasetTableHeader({ dataset }) {
  return (
    <div className="dataset-table-header">
      <span className="dth-title">{dataset.title}</span>
      <span className="dth-stat">{dataset.donorCount} donors</span>
    </div>
  );
}

export default DatasetTableHeader;
