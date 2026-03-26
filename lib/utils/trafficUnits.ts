const IEC_MULTIPLIERS: Record<string, number> = {
  '': 1,
  k: 1024,
  m: 1024 ** 2,
  g: 1024 ** 3,
  t: 1024 ** 4,
  p: 1024 ** 5,
  e: 1024 ** 6
}

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_PATTERN = /\u001b\[[0-9;]*m/g

function normalizeUnitPrefix (rawUnit: string): string {
  const normalized = rawUnit.toLocaleLowerCase()
  if (normalized === '' || normalized === 'b' || normalized === 'bit') {
    return ''
  }

  const prefix = normalized[0] ?? ''
  return prefix in IEC_MULTIPLIERS ? prefix : ''
}

function isBitUnit (rawUnit: string): boolean {
  const normalized = rawUnit.toLocaleLowerCase()
  if (normalized === '') {
    return false
  }

  if (normalized === 'bit') {
    return true
  }

  return normalized.includes('bit')
}

// We store traffic in bytes and use IEC multipliers internally.
// UI formatting intentionally stays unchanged and still shows the current labels.
export function convertTrafficValueToBytes (value: string): number {
  const normalizedValue = value
    .replace(ANSI_ESCAPE_PATTERN, '')
    .replace(',', '.')
    .trim()
    .toLocaleLowerCase()

  const match = normalizedValue.match(/([0-9]+(?:\.[0-9]+)?)\s*([kmgtpe]?)(?:i)?(bit|b|byte|bytes)?(?:\/s|ps)?/)
  if (!match) {
    return 0
  }

  const numericPart = Number(match[1])
  if (!Number.isFinite(numericPart)) {
    return 0
  }

  const unitPrefix = normalizeUnitPrefix(match[2] ?? '')
  const unitSuffix = match[3] ?? ''
  const multiplier = IEC_MULTIPLIERS[unitPrefix] ?? 1

  if (isBitUnit(unitSuffix)) {
    return numericPart * multiplier / 8
  }

  return numericPart * multiplier
}
