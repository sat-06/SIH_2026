/**
 * Resource Calculation Logic for Manganese Intelligence
 * Formula:
 * Resource (Mt) = Area (km²) × Prospective Fraction × Thickness (m) × Density (t/m³) × Ore Factor
 *
 * Units:
 * Area: km² (1 km² = 1,000,000 m²)
 * Volume: m³ = Area (m²) × Thickness (m) × Prospective Fraction
 * Tonnage: Tonnes = Volume (m³) × Density (t/m³) × Ore Factor
 * Million Tonnes (Mt) = Tonnage / 1,000,000
 * Notice: 1,000,000 m² / 1,000,000 = 1, so:
 * Resource (Mt) = Area (km²) × ProspectiveFraction × Thickness (m) × Density (t/m³) × OreFactor
 */

export interface ResourceInput {
  areaKm2: number;
  prospectiveFraction?: number; // default 0.65
  thicknessM: number;
  densityTm3: number;
  oreFactor: number;
  gradePct?: number;
}

export interface CalculatedResource {
  p50: number; // Million Tonnes
  p10: number; // Low estimate (conservative)
  p90: number; // High estimate (optimistic)
  volumeMm3: number; // Million m³
  disclaimer: string;
}

export const DISCLAIMER_TEXT =
  'AI-estimated potential resource. Preliminary and unverified. Not a certified mineral reserve.';

export function calculatePotentialResource(input: ResourceInput): CalculatedResource {
  const prospectiveFraction = input.prospectiveFraction ?? 0.65;
  const areaKm2 = Math.max(0, input.areaKm2);
  const thicknessM = Math.max(0, input.thicknessM);
  const densityTm3 = Math.max(0, input.densityTm3);
  const oreFactor = Math.max(0, Math.min(1, input.oreFactor));

  // Base P50 Tonnage in Mt
  const p50Raw = areaKm2 * prospectiveFraction * thicknessM * densityTm3 * oreFactor;
  const p50 = Math.round(p50Raw * 100) / 100;

  // P10 and P90 ranges via deterministic uncertainty factors
  const p10 = Math.round(p50 * 0.78 * 100) / 100;
  const p90 = Math.round(p50 * 1.22 * 100) / 100;

  const volumeMm3 = Math.round(areaKm2 * prospectiveFraction * thicknessM * 100) / 100;

  return {
    p50,
    p10,
    p90,
    volumeMm3,
    disclaimer: DISCLAIMER_TEXT,
  };
}
