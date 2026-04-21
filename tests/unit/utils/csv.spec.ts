import { describe, expect, it } from 'vitest'
import { toCsv } from '~/utils/csv'

describe('toCsv', () => {
  it('emits BOM + header + rows', () => {
    const csv = toCsv<{ a: string; b: number }>(
      [{ a: 'hi', b: 1 }],
      [
        { header: 'A', accessor: (r) => r.a },
        { header: 'B', accessor: (r) => r.b }
      ]
    )
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('A,B\r\n')
    expect(csv).toContain('hi,1\r\n')
  })

  it('escapes quotes, commas and newlines', () => {
    const csv = toCsv<{ v: string }>(
      [
        { v: 'hello, "world"' },
        { v: 'two\nlines' },
        { v: '' }
      ],
      [{ header: 'V', accessor: (r) => r.v }]
    )
    expect(csv).toContain('"hello, ""world"""')
    expect(csv).toContain('"two\nlines"')
  })

  it('renders null/undefined as empty cell', () => {
    const csv = toCsv<{ v: unknown }>(
      [{ v: null }, { v: undefined }],
      [{ header: 'V', accessor: (r) => r.v }]
    )
    // Strip leading BOM and trailing newline, then split lines.
    const lines = csv.replace(/^\uFEFF/, '').replace(/\r\n$/, '').split('\r\n')
    expect(lines).toEqual(['V', '', ''])
  })
})
