
const COLOR_HEX: Record<string, string> = {
  black: '#111827',
  white: '#ffffff',
  red: '#dc2626',
  blue: '#2563eb',
  navy: '#1e3a8a',
  'navy blue': '#1e3a8a',
  'dark blue': '#1e3a8a',
  'light blue': '#93c5fd',
  'sky blue': '#87ceeb',
  green: '#16a34a',
  yellow: '#eab308',
  orange: '#ea580c',
  pink: '#ec4899',
  purple: '#9333ea',
  brown: '#92400e',
  gray: '#6b7280',
  grey: '#6b7280',
  'light grey': '#d1d5db',
  'light gray': '#d1d5db',
  beige: '#d6c3a5',
  cream: '#fffdd0',
  gold: '#d4af37',
  silver: '#c0c0c0',
  taupe: '#8b8589',
  maroon: '#800000',
  burgundy: '#800020',
  olive: '#808000',
  teal: '#0d9488',
  khaki: '#c3b091',
};

export function getColorHex(color: string): string {
  return COLOR_HEX[color.trim().toLowerCase()] ?? '#e5e7eb';
}
