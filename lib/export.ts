import { toast } from "sonner";

// A generic function to export an array of objects to a CSV file.
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string = "export.csv"
): void {
  if (!data || data.length === 0) {
    toast.warning("No data to export.");
    return;
  }

  try {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(fieldName => {
          let cell = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
          // Escape commas and quotes
          cell = String(cell).replace(/"/g, '""');
          if (String(cell).includes(',')) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Data exported successfully!");
  } catch (error) {
    console.error("CSV Export Error:", error);
    toast.error("Failed to export data.");
  }
}