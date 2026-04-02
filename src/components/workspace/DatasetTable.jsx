import { useMemo } from 'react';
import './DatasetTable.css';

function DatasetTable({ data, columns, selectedRows, deletedRows, addedRowIds, sortConfig, onSelectRow, onSelectAll, onSort }) {
  const selectableRows = useMemo(
    () => data.filter(row => !deletedRows.has(row.donorId)),
    [data, deletedRows]
  );

  const allSelected = selectableRows.length > 0 &&
    selectableRows.every(row => selectedRows.has(row.donorId));

  const someSelected = selectableRows.some(row => selectedRows.has(row.donorId));

  return (
    <div className="dataset-table-wrapper">
      <table className="dataset-table">
        <thead>
          <tr>
            <th className="col-checkbox sticky-col-1">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={onSelectAll}
              />
            </th>
            {columns.map(col => (
              <th
                key={col.key}
                className={`${col.key === 'donorId' ? 'sticky-col-2' : ''} ${sortConfig?.column === col.key ? 'sorted' : ''}`}
                onClick={() => onSort(col.key)}
              >
                <span className="th-content">
                  {col.label}
                  {sortConfig?.column === col.key && (
                    <span className="th-sort-icon">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const isDeleted = deletedRows.has(row.donorId);
            const isSelected = selectedRows.has(row.donorId);
            const isAdded = addedRowIds && addedRowIds.has(row.donorId);
            return (
              <tr
                key={row.donorId}
                className={`${isDeleted ? 'row-deleted' : ''} ${isSelected ? 'row-selected' : ''} ${isAdded ? 'row-added' : ''}`}
              >
                <td className="col-checkbox sticky-col-1">
                  {isDeleted ? (
                    <span className="deleted-icon" title="Marked for deletion">✕</span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(row.donorId)}
                    />
                  )}
                </td>
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={col.key === 'donorId' ? 'sticky-col-2' : ''}
                  >
                    {row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="table-empty">No rows match the current filters</div>
      )}
    </div>
  );
}

export default DatasetTable;
