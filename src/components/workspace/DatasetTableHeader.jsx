import './DatasetTableHeader.css';

function DatasetTableHeader({ dataset, donorCount }) {
  // Prefer the live/filtered count passed from the workspace, fall back to
  // the dataset's canonical total when no override is provided.
  const count = typeof donorCount === 'number' ? donorCount : dataset.donorCount;
  return (
    <div className="dataset-table-header">
      <span className="dth-title">{dataset.title}</span>
      <span className="dth-stat">{count} donors</span>
    </div>
  );
}

export default DatasetTableHeader;
