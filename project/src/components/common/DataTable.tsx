import type { ReactNode } from "react";

export type DataColumn<RowData> = {
  key: keyof RowData | string;
  header: string;
  render?: (row: RowData, index: number) => ReactNode;
};

type DataTableProps<RowData> = {
  columns: DataColumn<RowData>[];
  emptyMessage: string;
  rows: RowData[];
};

export function DataTable<RowData extends { id?: string }>({
  columns,
  emptyMessage,
  rows,
}: DataTableProps<RowData>) {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render ? column.render(row, rowIndex) : String(row[column.key as keyof RowData] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="data-table__empty"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
