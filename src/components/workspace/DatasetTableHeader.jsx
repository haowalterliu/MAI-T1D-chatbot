import './DatasetTableHeader.css';

function DatasetTableHeader({ dataset }) {
  return (
    <div className="dataset-table-header">
      <span className="dth-title">{dataset.title}</span>
      <span className="dth-separator">·</span>
      <span className="dth-stat">{dataset.donorCount} Donors</span>
      {dataset.keyInfo.map((info, i) => (
        <span key={i} className="dth-chip">
          {info.label} {info.value}
        </span>
      ))}
      {dataset.modalities.map((mod, i) => (
        <span key={`mod-${i}`} className="dth-tag">{mod}</span>
      ))}
      <span className="dth-tag">{dataset.cellType}</span>
    </div>
  );
}

export default DatasetTableHeader;
