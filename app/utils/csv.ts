/**
 * RFC 4180-ish CSV generator. Handles quotes, commas, newlines, undefined/null.
 *
 * `rows` is any array; `columns` pairs header → accessor. UTF-8 BOM prefix makes
 * Excel happy out of the box.
 */
export interface CsvColumn<T> {
  header: string
  accessor: (row: T) => unknown
}

const BOM = '\uFEFF'

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'string' ? value : String(value)
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines: string[] = []
  lines.push(columns.map((c) => escapeCell(c.header)).join(','))
  for (const row of rows) {
    lines.push(columns.map((c) => escapeCell(c.accessor(row))).join(','))
  }
  return BOM + lines.join('\r\n') + '\r\n'
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
