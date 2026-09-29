/**
 * Formatting utilities for Manganese Intelligence Platform
 * Uses en-IN locale and tabular-nums formatting
 */

export function formatNumber(val: number, decimals: number = 1): string {
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatInteger(val: number): string {
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(Math.round(val));
}

export function formatMt(val: number | [number, number]): string {
  if (Array.isArray(val)) {
    return `${formatNumber(val[0], 1)}–${formatNumber(val[1], 1)} Mt`;
  }
  return `${formatNumber(val, 2)} Mt`;
}

export function formatKm2(val: number): string {
  return `${formatNumber(val, 1)} km²`;
}

export function formatPercent(val: number): string {
  return `${formatInteger(val)}%`;
}

export function formatCoord(lng: number, lat: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}
