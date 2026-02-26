/**
 * CSV Export utility — converts data arrays to CSV and triggers download.
 */

type Row = Record<string, string | number | boolean | null | undefined>;

export function toCSV(data: Row[], columns?: string[]): string {
    if (data.length === 0) return '';

    const keys = columns || Object.keys(data[0]);

    // Header row
    const header = keys.map(escapeCSVField).join(',');

    // Data rows
    const rows = data.map((row) =>
        keys.map((key) => escapeCSVField(String(row[key] ?? ''))).join(',')
    );

    return [header, ...rows].join('\n');
}

function escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

export function downloadCSV(data: Row[], filename: string, columns?: string[]) {
    const csv = toCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
