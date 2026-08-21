// CSV export utility for admin list pages.
// Generates a standards-compliant CSV string with proper escaping and
// triggers a browser download. No server round-trip needed — the data
// is already in the page.

function escapeCsvField(value: unknown): string {
  if (value == null) return ''
  const str = String(value)
  // Quote if it contains comma, quote, newline, or leading/trailing whitespace
  if (/["',\n\r]/.test(str) || /^\s|\s$/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const csv = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\r\n')

  // Prepend BOM so Excel reads UTF-8 correctly
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revoke after a short delay to ensure the download starts
  setTimeout(() => URL.revokeObjectURL(url), 200)
}

export function timestampedName(prefix: string): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  return `${prefix}-${date}.csv`
}
