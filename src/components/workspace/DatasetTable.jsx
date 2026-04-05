import { useMemo } from 'react';
import './DatasetTable.css';

function DatasetTable({ data, columns, idKey = 'donorId', selectedRows, deletedRows, addedRowIds, sortConfig, onSelectRow, onSelectAll, onSort }) {
  const selectableRows = useMemo(
    () => data.filter(row => !deletedRows.has(row[idKey])),
    [data, deletedRows, idKey]
  );

  const allSelected = selectableRows.length > 0 &&
    selectableRows.every(row => selectedRows.has(row[idKey]));

  const someSelected = selectableRows.some(row => selectedRows.has(row[idKey]));

  // The first column in the schema is treated as the "ID column" (sticky)
  const firstColKey = columns[0]?.key;

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
                className={`${col.key === firstColKey ? 'sticky-col-2' : ''} ${sortConfig?.column === col.key ? 'sorted' : ''}`}
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
            const rowId = row[idKey];
            const isDeleted = deletedRows.has(rowId);
            const isSelected = selectedRows.has(rowId);
            const isAdded = addedRowIds && addedRowIds.has(rowId);
            return (
              <tr
                key={rowId}
                className={`${isDeleted ? 'row-deleted' : ''} ${isSelected ? 'row-selected' : ''} ${isAdded ? 'row-added' : ''}`}
              >
                <td className="col-checkbox sticky-col-1">
                  {isDeleted ? (
                    <span className="deleted-icon" title="Marked for deletion">✕</span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(rowId)}
                    />
                  )}
                </td>
                {columns.map(col => {
                  const v = row[col.key];
                  let display;
                  if (v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v))) {
                    display = '—';
                  } else if (typeof v === 'boolean') {
                    display = v ? 'Yes' : 'No';
                  } else if (typeof v === 'number') {
                    // Modality flags (0/1) → Yes/No. Other numbers: render as-is.
                    const isFlagCol = [
                      'scRNA-seq','scATAC-seq','snMultiomics','CITE-seq Protein','TEA-seq',
                      'BCR-seq','TCR-seq','Bulk RNA-seq','Bulk ATAC-seq','WGS','Calcium Imaging',
                      'Flow Cytometry','Oxygen Consumption','Perifusion','CODEX','IMC','Histology',
                      'gada','ia_2','iaa','znt8'
                    ].includes(col.key);
                    display = isFlagCol && (v === 0 || v === 1) ? (v === 1 ? 'Yes' : 'No') : v;
                  } else {
                    display = v;
                  }
                  return (
                    <td
                      key={col.key}
                      className={col.key === firstColKey ? 'sticky-col-2' : ''}
                    >
                      {display}
                    </td>
                  );
                })}
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
