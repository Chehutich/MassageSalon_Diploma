import React from "react";
import { Table, TableProps } from "antd";

interface DataTableProps<T> extends TableProps<T> {
  onRowClick?: (record: T) => void;
  onRowDoubleClick?: (record: T) => void;
}

export function DataTable<T extends object>({
  onRowClick,
  onRowDoubleClick,
  ...props
}: DataTableProps<T>) {
  return (
    <Table
      {...props}
      pagination={{
        defaultPageSize: 5,
        showSizeChanger: true,
        showTotal: (total) => `Всього: ${total}`,
        ...props.pagination,
      }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        onDoubleClick: () => onRowDoubleClick?.(record),
        style: {
          cursor: onRowClick || onRowDoubleClick ? "pointer" : "default",
        },
      })}
    />
  );
}
