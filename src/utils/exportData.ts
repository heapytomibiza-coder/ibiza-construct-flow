export interface ExportColumn {
  header: string;
  accessor: string | ((row: any) => any);
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  columns: ExportColumn[];
  data: any[];
  format?: 'csv' | 'json';
}

export function exportToCSV(options: ExportOptions): void {
  const { filename, columns, data } = options;

  // Create CSV header
  const headers = columns.map(col => col.header).join(',');

  // Create CSV rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value;
      if (typeof col.accessor === 'function') {
        value = col.accessor(row);
      } else {
        value = row[col.accessor];
      }

      // Apply formatting if provided
      if (col.format) {
        value = col.format(value);
      }

      // Escape and quote the value
      if (value === null || value === undefined) {
        return '""';
      }
      const stringValue = String(value);
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  }).join('\n');

  // Combine headers and rows
  const csv = `${headers}\n${rows}`;

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToJSON(options: ExportOptions): void {
  const { filename, columns, data } = options;

  // Transform data based on columns
  const transformedData = data.map(row => {
    const obj: Record<string, any> = {};
    columns.forEach(col => {
      let value;
      if (typeof col.accessor === 'function') {
        value = col.accessor(row);
      } else {
        value = row[col.accessor];
      }

      if (col.format) {
        value = col.format(value);
      }

      obj[col.header] = value;
    });
    return obj;
  });

  // Create JSON and download
  const json = JSON.stringify(transformedData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportData(options: ExportOptions): void {
  const format = options.format || 'csv';
  
  if (format === 'csv') {
    exportToCSV(options);
  } else if (format === 'json') {
    exportToJSON(options);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
