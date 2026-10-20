import { Injectable } from '@angular/core';

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

@Injectable({ providedIn: 'root' })
export class CsvExportService {
  download<T>(fileName: string, rows: T[], columns: CsvColumn<T>[]): void {
    const quote = (value: unknown): string => {
      const normalized = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
      return `"${normalized.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(column => quote(column.header)).join(';'),
      ...rows.map(row => columns.map(column => quote(column.value(row))).join(';'))
    ].join('\r\n');

    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
