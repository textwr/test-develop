import type { ReactNode } from "react";
import { cn } from "@/app/utils/cn";

export type DataColumn<RowData> = {
  key: keyof RowData | string;
  header: string;
  render?: (row: RowData, index: number) => ReactNode;
  cellClassName?: string;
  headerClassName?: string;
};

type DataTableProps<RowData> = {
  columns: DataColumn<RowData>[];
  emptyMessage: string;
  rows: RowData[];
  onRowClick?: (row: RowData) => void;
  containerClassName?: string;
  rowClassName?: (row: RowData) => string | undefined;
  tableMinWidthClassName?: string;
};

export function DataTable<RowData extends { id?: string }>({
  columns,
  containerClassName,
  emptyMessage,
  onRowClick,
  rowClassName,
  rows,
  tableMinWidthClassName = "min-w-[1600px]",
}: DataTableProps<RowData>) {
  return (
    <div className={cn("overflow-auto rounded-[12px] border border-[#d8dde6] bg-white", containerClassName)}>
      <table className={cn("w-full border-collapse", tableMinWidthClassName)}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                className={cn(
                  "sticky top-0 bg-[#5669d8] px-4 py-[10px] text-center text-[13px] font-semibold text-white",
                  index === 0 && "rounded-tl-[10px]",
                  index === columns.length - 1 && "rounded-tr-[10px]",
                  column.headerClassName,
                )}
                key={String(column.key)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr
                className={cn(
                  "border-b border-[#e7ebf1] text-[13px] text-[#4b5563] last:border-b-0",
                  onRowClick && "cursor-pointer transition-colors hover:bg-[#f7f8ff]",
                  rowClassName?.(row),
                )}
                key={row.id ?? rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    className={cn("whitespace-nowrap px-4 py-[11px] text-center", column.cellClassName)}
                    key={String(column.key)}
                  >
                    {column.render ? column.render(row, rowIndex) : String(row[column.key as keyof RowData] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-4 py-10 text-center text-[13px] text-[#94a3b8]"
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
