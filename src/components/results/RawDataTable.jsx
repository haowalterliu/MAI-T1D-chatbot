import { useState } from 'react';
import './RawDataTable.css';

function RawDataTable({ data }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="raw-data-table">
      <button
        className="raw-data-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Raw Data</span>
        <span className="raw-data-toggle-icon">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="raw-data-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Gene</th>
                <th>Importance</th>
                <th>p-Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="gene-name">{row.gene}</td>
                  <td>{row.importance.toFixed(2)}</td>
                  <td>{row.pValue.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RawDataTable;
