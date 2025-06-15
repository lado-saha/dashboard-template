export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableSearchableColumn {
  id: string;
  title: string;
}

export interface DataTableFilterableColumn<TData = any> extends DataTableSearchableColumn {
  options: DataTableFilterOption[];
}