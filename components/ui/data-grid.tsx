"use client";

import React from "react";
import { Table, Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface DataGridProps<TData> {
  /** The TanStack Table instance which manages state (selection, pagination, etc.). */
  table: Table<TData>;
  /** A function that takes a table row and returns the React component to render for that item. */
  renderCardAction: (props: { row: Row<TData> }) => React.ReactNode;
  /** Optional class name for the grid container. */
  className?: string;
}

/**
 * A generic, reusable grid component for displaying data from a TanStack Table instance.
 * It uses a render prop (`renderCard`) to display a custom component for each item,
 * making it adaptable to any data type.
 */
export function DataGrid<TData>({
  table,
  renderCardAction,
  className,
}: DataGridProps<TData>) {
  const { rows } = table.getRowModel();

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6",
        className
      )}
    >
      {rows.map((row) => (
        <div key={row.id}>{renderCardAction({ row })}</div>
      ))}
    </div>
  );
}
