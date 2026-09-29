import {
  ZoneProperties,
  ZoneFeature,
  ZoneCollection,
  ProspectivityPointCollection,
  MineCollection,
  GeologyCollection,
  LineamentCollection,
  RoadCollection,
  MonthlyProductionPoint,
  ProductionForecastResponse,
  ShortfallDriver,
  ModelPerformanceMetrics,
  GroundTruthRecord,
  ModelVersionHistory,
  DataSourceItem,
  SystemServiceStatus,
} from '../types/domain';
import { calculatePotentialResource } from '../lib/resourceCalc';
import { computeEPS, getPriorityTier, getProspectivityStatus, getRecommendedAction } from '../lib/scoring';

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260929);

// Create polygon geometry centered at [lng, lat]
function createZonePolygon(centerLng: number, centerLat: number, radiusKm: number): [number, number][][] {
  const points: [number, number][] = [];
  const sides = 6 + Math.floor(rng() * 4);
  const kmToDegLat = 1 / 110.574;
  const kmToDegLng = 1 / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    const r = radiusKm * (0.7 + rng() * 0.5);
    const lng = centerLng + r * Math.cos(angle) * kmToDegLng;
    const lat = centerLat + r * Math.sin(angle) * kmToDegLat;
    points.push([Math.round(lng * 10000) / 10000, Math.round(lat * 10000) / 10000]);
  }
  points.push(points[0]); // close polygon
  return [points];
}

// 1. HEADLINE ZONES (Hand-tuned exact values)
const HEADLINE_ZONES: ZoneProperties[] = [
  {
    id: 'MN-047',
    name: 'Keonjhar North-West Sector',
    district: 'Keonjhar',
    regionId: 'odisha-belt',
    prospectivityScore: 89,
    confidence: 82,
    confidenceComponents: { modelAgreement: 88, featureCoverage: 84, dataQuality: 74 },
    areaKm2: 14.6,
    status: 'high',
    accessibility: 'Excellent',
    accessibilityScore: 0.95,
    terrainDifficulty: 'Low',
    explorationCostIndex: 32,
    shap: { geology: 31, spectral: 26, terrain: 18, lineaments: 15, historical: 10 },
    spectral: { ironOxideRatio: 2.45, clayIndex: 1.82, lateriteIndex: 3.15 },
    geological: { hostFormation: 'Iron Ore Supergroup (BIF/BHQ)', distToContactKm: 0.4, faultProximityKm: 0.8 },
    terrain: { elevationM: 420, slopeDeg: 6.5, drainageDensity: 1.8 },
    resource: {
      p10: 8.2,
      p50: 9.8,
      p90: 11.4,
      thicknessM: 14.5,
      densityTm3: 3.2,
      oreFactor: 0.65,
      gradePct: 38.5,
    },
    priorityScore: 88,
    priorityTier: 'Tier 1',
    recommendedAction: 'Field validation recommended',
    recommendedActionReason: 'High priority score (88) and high confidence (82%) with optimal road access.',
    nearestOccurrenceKm: 1.2,
    timeToSupplyYears: 2.5,
    centerCoordinate: [85.58, 21.65],
  },
  {
    id: 'MN-012',
    name: 'Barbil Deep Structural Trend',
    district: 'Keonjhar',
    regionId: 'odisha-belt',
    prospectivityScore: 92, // HIGHEST PROSPECTIVITY
    confidence: 54, // LOW CONFIDENCE!
    confidenceComponents: { modelAgreement: 50, featureCoverage: 48, dataQuality: 64 },
    areaKm2: 22.4,
    status: 'high',
    accessibility: 'Remote',
    accessibilityScore: 0.2,
    terrainDifficulty: 'High',
    explorationCostIndex: 78,
    shap: { geology: 38, spectral: 15, terrain: 12, lineaments: 25, historical: 10 },
    spectral: { ironOxideRatio: 2.9, clayIndex: 1.4, lateriteIndex: 2.8 },
    geological: { hostFormation: 'Gangpur Group Manganese Formation', distToContactKm: 0.2, faultProximityKm: 0.3 },
    terrain: { elevationM: 780, slopeDeg: 22.0, drainageDensity: 3.2 },
    resource: { p10: 12.1, p50: 15.5, p90: 18.9, thicknessM: 18.0, densityTm3: 3.4, oreFactor: 0.6, gradePct: 41.0 },
    priorityScore: 58, // TIER 2 despite highest prospectivity! (Shows trade-off insight)
    priorityTier: 'Tier 2',
    recommendedAction: 'Further remote sensing analysis',
    recommendedActionReason: 'Highest prospectivity (92%) offset by high cost index (78) and low confidence (54%).',
    nearestOccurrenceKm: 4.8,
    timeToSupplyYears: 5.0,
    centerCoordinate: [85.42, 22.12],
  },
  {
    id: 'MN-023',
    name: 'Joda South Extended Extension',
    district: 'Keonjhar',
    regionId: 'odisha-belt',
    prospectivityScore: 78,
    confidence: 88,
    confidenceComponents: { modelAgreement: 90, featureCoverage: 89, dataQuality: 85 },
    areaKm2: 11.2,
    status: 'high',
    accessibility: 'Excellent',
    accessibilityScore: 0.9,
    terrainDifficulty: 'Low',
    explorationCostIndex: 28,
    shap: { geology: 25, spectral: 28, terrain: 15, lineaments: 12, historical: 20 },
    spectral: { ironOxideRatio: 2.1, clayIndex: 2.0, lateriteIndex: 2.9 },
    geological: { hostFormation: 'Iron Ore Supergroup', distToContactKm: 0.8, faultProximityKm: 1.2 },
    terrain: { elevationM: 390, slopeDeg: 4.2, drainageDensity: 1.2 },
    resource: { p10: 5.4, p50: 6.8, p90: 8.2, thicknessM: 12.0, densityTm3: 3.1, oreFactor: 0.65, gradePct: 36.0 },
    priorityScore: 82,
    priorityTier: 'Tier 1',
    recommendedAction: 'Field validation recommended',
    recommendedActionReason: 'Solid prospectivity (78%) backed by 88% confidence and proximity to operating Joda mines.',
    nearestOccurrenceKm: 0.9,
    timeToSupplyYears: 1.8,
    centerCoordinate: [85.52, 21.98],
  },
  {
    id: 'MN-088',
    name: 'Ukwa-Bharweli Shear Zone',
    district: 'Balaghat',
    regionId: 'mp-mh-belt',
    prospectivityScore: 84,
    confidence: 79,
    confidenceComponents: { modelAgreement: 82, featureCoverage: 76, dataQuality: 79 },
    areaKm2: 18.5,
    status: 'high',
    accessibility: 'Moderate',
    accessibilityScore: 0.75,
    terrainDifficulty: 'Moderate',
    explorationCostIndex: 42,
    shap: { geology: 35, spectral: 20, terrain: 15, lineaments: 20, historical: 10 },
    spectral: { ironOxideRatio: 2.6, clayIndex: 1.9, lateriteIndex: 3.0 },
    geological: { hostFormation: 'Sausar Group (Mansar Formation)', distToContactKm: 0.3, faultProximityKm: 0.5 },
    terrain: { elevationM: 520, slopeDeg: 12.4, drainageDensity: 2.1 },
    resource: { p10: 10.8, p50: 13.8, p90: 16.8, thicknessM: 16.0, densityTm3: 3.3, oreFactor: 0.7, gradePct: 43.5 },
    priorityScore: 84,
    priorityTier: 'Tier 1',
    recommendedAction: 'Field validation recommended',
    recommendedActionReason: 'High grade potential (43.5% Mn) in prime Sausar manganese schist formation.',
    nearestOccurrenceKm: 2.1,
    timeToSupplyYears: 3.0,
    centerCoordinate: [80.35, 21.88],
  },
  {
    id: 'MN-105',
    name: 'Bonai-Sundergarh Basin Sector B',
    district: 'Sundergarh',
    regionId: 'odisha-belt',
    prospectivityScore: 66,
    confidence: 72,
    confidenceComponents: { modelAgreement: 74, featureCoverage: 70, dataQuality: 72 },
    areaKm2: 28.0,
    status: 'medium',
    accessibility: 'Moderate',
    accessibilityScore: 0.75,
    terrainDifficulty: 'Moderate',
    explorationCostIndex: 48,
    shap: { geology: 28, spectral: 24, terrain: 22, lineaments: 16, historical: 10 },
    spectral: { ironOxideRatio: 1.8, clayIndex: 2.1, lateriteIndex: 2.2 },
    geological: { hostFormation: 'Bonai Volcanic Series', distToContactKm: 1.4, faultProximityKm: 2.1 },
    terrain: { elevationM: 450, slopeDeg: 9.1, drainageDensity: 1.9 },
    resource: { p10: 9.5, p50: 12.2, p90: 14.9, thicknessM: 10.0, densityTm3: 3.0, oreFactor: 0.55, gradePct: 32.0 },
    priorityScore: 64,
    priorityTier: 'Tier 2',
    recommendedAction: 'Further remote sensing analysis',
    recommendedActionReason: 'Large area (28 km²) with moderate prospectivity requiring follow-up geological mapping.',
    nearestOccurrenceKm: 6.5,
    timeToSupplyYears: 4.0,
    centerCoordinate: [84.95, 21.82],
  },
  {
    id: 'MN-015',
    name: 'Bhandara South Ore Body Extension',
    district: 'Bhandara',
    regionId: 'mp-mh-belt',
    prospectivityScore: 71,
    confidence: 68,
    confidenceComponents: { modelAgreement: 70, featureCoverage: 66, dataQuality: 68 },
    areaKm2: 9.8,
    status: 'medium',
    accessibility: 'Excellent',
    accessibilityScore: 0.9,
    terrainDifficulty: 'Low',
    explorationCostIndex: 35,
    shap: { geology: 30, spectral: 22, terrain: 18, lineaments: 18, historical: 12 },
    spectral: { ironOxideRatio: 2.0, clayIndex: 1.7, lateriteIndex: 2.5 },
    geological: { hostFormation: 'Sausar Group (Chhorbaoli Fm)', distToContactKm: 0.9, faultProximityKm: 1.1 },
    terrain: { elevationM: 310, slopeDeg: 3.8, drainageDensity: 1.4 },
    resource: { p10: 4.1, p50: 5.2, p90: 6.3, thicknessM: 11.0, densityTm3: 3.2, oreFactor: 0.6, gradePct: 35.5 },
    priorityScore: 71,
    priorityTier: 'Tier 1',
    recommendedAction: 'Field validation recommended',
    recommendedActionReason: 'Favourable infrastructure and low cost index boost EPS into Tier 1.',
    nearestOccurrenceKm: 1.8,
    timeToSupplyYears: 2.0,
    centerCoordinate: [79.65, 21.18],
  },
];

// Generate synthetic zones to total 48 zones
export function generateSyntheticZones(): ZoneProperties[] {
  const zones: ZoneProperties[] = [...HEADLINE_ZONES];
  const districts = [
    { name: 'Keonjhar', regionId: 'odisha-belt', centerLng: 85.5, centerLat: 21.8 },
    { name: 'Sundergarh', regionId: 'odisha-belt', centerLng: 84.8, centerLat: 22.0 },
    { name: 'Balaghat', regionId: 'mp-mh-belt', centerLng: 80.3, centerLat: 21.9 },
    { name: 'Nagpur', regionId: 'mp-mh-belt', centerLng: 79.2, centerLat: 21.3 },
    { name: 'Bhandara', regionId: 'mp-mh-belt', centerLng: 79.7, centerLat: 21.2 },
  ];

  for (let i = zones.length + 1; i <= 48; i++) {
    const id = `MN-${String(i).padStart(3, '0')}`;
    const dist = districts[Math.floor(rng() * districts.length)];
    const offsetLng = (rng() - 0.5) * 0.8;
    const offsetLat = (rng() - 0.5) * 0.8;
    const centerLng = Math.round((dist.centerLng + offsetLng) * 10000) / 10000;
    const centerLat = Math.round((dist.centerLat + offsetLat) * 10000) / 10000;

    const prospectivityScore = Math.round(30 + rng() * 58);
    const confidence = Math.round(45 + rng() * 45);
    const areaKm2 = Math.round((4.0 + rng() * 22.0) * 10) / 10;
    const costIndex = Math.round(25 + rng() * 60);

    const accessLevels: AccessibilityLevel[] = ['Excellent', 'Moderate', 'Challenging', 'Remote'];
    const accessibility = accessLevels[Math.floor(rng() * accessLevels.length)];
    const accessScore = accessibility === 'Excellent' ? 0.95 : accessibility === 'Moderate' ? 0.75 : accessibility === 'Challenging' ? 0.45 : 0.2;

    const thicknessM = Math.round((6.0 + rng() * 12.0) * 10) / 10;
    const densityTm3 = Math.round((2.8 + rng() * 0.7) * 10) / 10;
    const oreFactor = Math.round((0.45 + rng() * 0.25) * 100) / 100;
    const gradePct = Math.round((24.0 + rng() * 18.0) * 10) / 10;

    const calcRes = calculatePotentialResource({
      areaKm2,
      thicknessM,
      densityTm3,
      oreFactor,
      gradePct,
    });

    const eps = computeEPS(prospectivityScore, confidence, calcRes.p50, accessScore, costIndex);
    const status = getProspectivityStatus(prospectivityScore);
    const priorityTier = getPriorityTier(eps);
    const recAction = getRecommendedAction(prospectivityScore, confidence, eps, costIndex, accessibility);

    const shapSum = 100;
    const gShap = Math.round(20 + rng() * 20);
    const sShap = Math.round(15 + rng() * 20);
    const tShap = Math.round(10 + rng() * 15);
    const lShap = Math.round(10 + rng() * 15);
    const hShap = shapSum - (gShap + sShap + tShap + lShap);

    zones.push({
      id,
      name: `${dist.name} Sector-${String.fromCharCode(65 + (i % 26))}`,
      district: dist.name,
      regionId: dist.regionId,
      prospectivityScore,
      confidence,
      confidenceComponents: {
        modelAgreement: Math.round(confidence * (0.9 + rng() * 0.2)),
        featureCoverage: Math.round(confidence * (0.85 + rng() * 0.25)),
        dataQuality: Math.round(confidence * (0.8 + rng() * 0.3)),
      },
      areaKm2,
      status,
      accessibility,
      accessibilityScore: accessScore,
      terrainDifficulty: accessScore > 0.7 ? 'Low' : accessScore > 0.4 ? 'Moderate' : 'High',
      explorationCostIndex: costIndex,
      shap: { geology: gShap, spectral: sShap, terrain: tShap, lineaments: lShap, historical: hShap },
      spectral: {
        ironOxideRatio: Math.round((1.2 + rng() * 1.6) * 100) / 100,
        clayIndex: Math.round((1.0 + rng() * 1.3) * 100) / 100,
        lateriteIndex: Math.round((1.5 + rng() * 1.8) * 100) / 100,
      },
      geological: {
        hostFormation: i % 2 === 0 ? 'Iron Ore Supergroup' : 'Sausar Group Manganese Schist',
        distToContactKm: Math.round((0.2 + rng() * 3.5) * 10) / 10,
        faultProximityKm: Math.round((0.1 + rng() * 4.0) * 10) / 10,
      },
      terrain: {
        elevationM: Math.round(280 + rng() * 450),
        slopeDeg: Math.round((3.0 + rng() * 18.0) * 10) / 10,
        drainageDensity: Math.round((1.0 + rng() * 2.5) * 10) / 10,
      },
      resource: {
        p10: calcRes.p10,
        p50: calcRes.p50,
        p90: calcRes.p90,
        thicknessM,
        densityTm3,
        oreFactor,
        gradePct,
      },
      priorityScore: eps,
      priorityTier,
      recommendedAction: recAction.action,
      recommendedActionReason: recAction.reasonText,
      nearestOccurrenceKm: Math.round((0.5 + rng() * 8.0) * 10) / 10,
      timeToSupplyYears: Math.round((1.5 + rng() * 4.5) * 10) / 10,
      centerCoordinate: [centerLng, centerLat],
    });
  }

  return zones;
}

export const ALL_ZONES = generateSyntheticZones();

export function getZonesGeoJSON(): ZoneCollection {
  const features: ZoneFeature[] = ALL_ZONES.map((z) => ({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: createZonePolygon(z.centerCoordinate[0], z.centerCoordinate[1], Math.sqrt(z.areaKm2) * 0.4),
    },
    properties: z,
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

// 2. PROSPECTIVITY GRID POINTS (~3,000 points for Heatmap)
export function getProspectivityPointsGeoJSON(): ProspectivityPointCollection {
  const features = [];
  const bounds = [
    { minLng: 84.2, maxLng: 86.2, minLat: 21.0, maxLat: 22.5 }, // Odisha belt
    { minLng: 78.8, maxLng: 81.2, minLat: 20.8, maxLat: 22.2 }, // MP-MH belt
  ];

  let idCounter = 0;
  for (const b of bounds) {
    const latStep = 0.05;
    const lngStep = 0.05;
    for (let lat = b.minLat; lat <= b.maxLat; lat += latStep) {
      for (let lng = b.minLng; lng <= b.maxLng; lng += lngStep) {
        idCounter++;
        // find distance to nearest zone center
        let minDist = 999;
        let score = 20 + rng() * 20;
        let matchedZoneId: string | undefined;

        for (const z of ALL_ZONES) {
          const dx = lng - z.centerCoordinate[0];
          const dy = lat - z.centerCoordinate[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            if (dist < 0.15) {
              score = Math.min(100, z.prospectivityScore * (1 - dist / 0.2) + rng() * 10);
              matchedZoneId = z.id;
            }
          }
        }

        features.push({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [Math.round(lng * 1000) / 1000, Math.round(lat * 1000) / 1000],
          },
          properties: {
            score: Math.round(score),
            zoneId: matchedZoneId,
          },
        });
      }
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

// 3. MINES GEOJSON (~12 operating mines / deposits)
export function getMinesGeoJSON(): MineCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [85.53, 21.96] },
        properties: { id: 'MNE-01', name: 'Joda West Mine (MOIL/Tata)', district: 'Keonjhar', type: 'Operating Mine', annualProductionMt: 0.45, gradePct: 38.0 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [85.41, 22.11] },
        properties: { id: 'MNE-02', name: 'Barbil Manganese Complex', district: 'Keonjhar', type: 'Operating Mine', annualProductionMt: 0.32, gradePct: 40.5 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [80.31, 21.86] },
        properties: { id: 'MNE-03', name: 'Bharweli Underground Mine', district: 'Balaghat', type: 'Operating Mine', annualProductionMt: 0.68, gradePct: 44.0 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [80.42, 21.92] },
        properties: { id: 'MNE-04', name: 'Ukwa Underground Deposit', district: 'Balaghat', type: 'Operating Mine', annualProductionMt: 0.28, gradePct: 42.0 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [79.68, 21.32] },
        properties: { id: 'MNE-05', name: 'Dongri Buzurg Ore Body', district: 'Bhandara', type: 'Operating Mine', annualProductionMt: 0.35, gradePct: 37.5 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [79.35, 21.41] },
        properties: { id: 'MNE-06', name: 'Mansar Opencast Mine', district: 'Nagpur', type: 'Operating Mine', annualProductionMt: 0.22, gradePct: 36.0 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [84.88, 21.85] },
        properties: { id: 'MNE-07', name: 'Koyera Manganese Quarry', district: 'Sundergarh', type: 'Historical Deposit', annualProductionMt: 0.08, gradePct: 31.0 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [85.62, 21.61] },
        properties: { id: 'MNE-08', name: 'Siljora-Kalimati Prospect', district: 'Keonjhar', type: 'Occurence', gradePct: 34.0 },
      },
    ],
  };
}

// 4. GEOLOGY FORMATION POLYGONS
export function getGeologyGeoJSON(): GeologyCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[85.3, 21.5], [85.8, 21.5], [85.8, 22.2], [85.3, 22.2], [85.3, 21.5]]],
        },
        properties: { id: 'GEO-01', formationName: 'Iron Ore Supergroup (BHQ/BIF)', lithology: 'Banded Hematite Jasper & Mn Ore Beds', age: 'Archean-Palaeoproterozoic', colorHex: '#4A3B32' },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[80.1, 21.6], [80.6, 21.6], [80.6, 22.1], [80.1, 22.1], [80.1, 21.6]]],
        },
        properties: { id: 'GEO-02', formationName: 'Sausar Group (Mansar Formation)', lithology: 'Gondite & Manganese Schist', age: 'Mesoproterozoic', colorHex: '#3D4537' },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[84.5, 21.6], [85.2, 21.6], [85.2, 22.1], [84.5, 22.1], [84.5, 21.6]]],
        },
        properties: { id: 'GEO-03', formationName: 'Gangpur Group', lithology: 'Phyllite, Slate & Gonditic Horizon', age: 'Palaeoproterozoic', colorHex: '#323D47' },
      },
    ],
  };
}

// 5. LINEAMENTS LINESTRING GEOJSON
export function getLineamentsGeoJSON(): LineamentCollection {
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[85.35, 21.55], [85.65, 22.15]] }, properties: { id: 'LIN-01', type: 'Fault', lengthKm: 72 } },
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[85.20, 21.75], [85.75, 21.95]] }, properties: { id: 'LIN-02', type: 'Shear Zone', lengthKm: 64 } },
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[80.15, 21.70], [80.55, 22.05]] }, properties: { id: 'LIN-03', type: 'Fault', lengthKm: 58 } },
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[79.40, 21.10], [79.85, 21.45]] }, properties: { id: 'LIN-04', type: 'Fracture', lengthKm: 46 } },
    ],
  };
}

// 6. ROADS GEOJSON
export function getRoadsGeoJSON(): RoadCollection {
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[85.2, 21.4], [85.6, 21.8], [85.4, 22.2]] }, properties: { id: 'RD-01', name: 'NH-520 (Mining Corridor)', type: 'National Highway' } },
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[79.2, 21.1], [79.8, 21.3], [80.4, 21.9]] }, properties: { id: 'RD-02', name: 'SH-26 Balaghat Express Corridor', type: 'State Highway' } },
    ],
  };
}

// 7. HISTORICAL & FORECAST PRODUCTION DATA (36 Months History + 12 Months Forecast)
export function getProductionData(horizonMonths: 3 | 6 | 12 = 12): ProductionForecastResponse {
  const months: MonthlyProductionPoint[] = [];

  // 36 months of history (2022-01 to 2024-12)
  const startDate = new Date(2022, 0, 1);
  for (let i = 0; i < 36; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2' });
    const monthIdx = d.getMonth(); // 0..11

    // Monsoon dip in July (6), Aug (7), Sept (8)
    const monsoonFactor = monthIdx === 6 ? 0.72 : monthIdx === 7 ? 0.68 : monthIdx === 8 ? 0.78 : 1.0;
    const baseProd = (0.26 + rng() * 0.04) * monsoonFactor;
    const demand = 0.32 + (i / 36) * 0.06 + (rng() - 0.5) * 0.02; // growing demand

    months.push({
      month: mStr,
      label,
      isHistorical: true,
      actualProductionMt: Math.round(baseProd * 100) / 100,
      demandMt: Math.round(demand * 100) / 100,
      shortfallMt: Math.max(0, Math.round((demand - baseProd) * 100) / 100),
    });
  }

  // Next 12 months forecast (2025-01 to 2025-12)
  const fcStartDate = new Date(2025, 0, 1);
  for (let i = 0; i < 12; i++) {
    const d = new Date(fcStartDate.getFullYear(), fcStartDate.getMonth() + i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2' });
    const monthIdx = d.getMonth();

    const monsoonFactor = monthIdx === 6 ? 0.70 : monthIdx === 7 ? 0.66 : monthIdx === 8 ? 0.76 : 1.0;
    const p50 = (0.28 + (i / 12) * 0.02) * monsoonFactor;
    const uncertaintySpan = 0.03 + (i / 12) * 0.04; // widening band
    const p10 = p50 - uncertaintySpan;
    const p90 = p50 + uncertaintySpan;
    const demand = 0.38 + (i / 12) * 0.04;

    months.push({
      month: mStr,
      label,
      isHistorical: false,
      forecastP50Mt: Math.round(p50 * 100) / 100,
      forecastP10Mt: Math.round(p10 * 100) / 100,
      forecastP90Mt: Math.round(p90 * 100) / 100,
      demandMt: Math.round(demand * 100) / 100,
      shortfallMt: Math.max(0, Math.round((demand - p50) * 100) / 100),
    });
  }

  // Compute exact totals for selected horizon
  const forecastItems = months.filter((m) => !m.isHistorical).slice(0, horizonMonths);
  const cumFc = forecastItems.reduce((acc, m) => acc + (m.forecastP50Mt || 0), 0);
  const cumDemand = forecastItems.reduce((acc, m) => acc + m.demandMt, 0);
  const cumShortfall = Math.max(0, cumDemand - cumFc);

  // Exact default values requirement for 3-month horizon: Expected production ~0.94, demand ~1.20, shortfall ~0.26 MT
  // Scale / format cleanly
  const cumFcFormatted = Math.round(cumFc * 100) / 100;
  const cumDemandFormatted = Math.round(cumDemand * 100) / 100;
  const cumShortfallFormatted = Math.round(cumShortfall * 100) / 100;

  return {
    horizonMonths,
    model: 'Ensemble (SARIMAX + XGBoost)',
    series: months,
    summary: {
      cumulativeHistoricalMt: 8.85,
      cumulativeForecastMt: cumFcFormatted,
      cumulativeDemandMt: cumDemandFormatted,
      cumulativeShortfallMt: cumShortfallFormatted,
      keyDriversText: 'Key drivers: monsoon seasonal slowdown in Q3, aging pit head grades in Balaghat, rising steel mill ferro-alloy demand.',
    },
  };
}

// 8. SHORTFALL DRIVERS
export const SHORTFALL_DRIVERS: ShortfallDriver[] = [
  {
    id: 'drv-01',
    category: 'Production Capacity',
    title: 'Aging Underground Extraction Shafts',
    impactMagnitude: 8.5,
    impactDirection: 'Negative',
    explanation: 'Deep MOIL underground shafts operating near design capacity with increased hoisting turnaround times.',
    tooltip: 'Equipment fatigue and deeper extraction depths reduce hourly ore throughput by ~12%.',
  },
  {
    id: 'drv-02',
    category: 'Ore Grade',
    title: 'High-Grade Direct Charge Depletion',
    impactMagnitude: 7.2,
    impactDirection: 'Negative',
    explanation: 'Run-of-mine Mn grade declining from 42% to 35%, requiring double tonnage washing/beneficiation.',
    tooltip: 'Requires additional processing steps, decreasing net usable ferro-manganese grade yield.',
  },
  {
    id: 'drv-03',
    category: 'Demand Growth',
    title: 'National Crude Steel Expansion Target',
    impactMagnitude: 9.0,
    impactDirection: 'Negative',
    explanation: 'National Steel Policy target (300 MTPA by 2030) driving 8.5% annual ferro-manganese demand increase.',
    tooltip: 'Domestic steel plants consuming ~10kg Mn per tonne of crude steel output.',
  },
  {
    id: 'drv-04',
    category: 'Operational Constraints',
    title: 'Monsoon Seasonal Pit Inundation',
    impactMagnitude: 6.8,
    impactDirection: 'Negative',
    explanation: 'Heavy rainfall in Keonjhar/Balaghat belts reduces opencast excavation by 30–40% during July–September.',
    tooltip: 'Seasonal dewatering limits hauling and road transport speed.',
  },
];

// 9. MODEL ANALYTICS PERFORMANCE DATA
export function getModelPerformance(modelId: 'rf' | 'xgb' | 'cnn' | 'fusion' = 'fusion'): ModelPerformanceMetrics {
  const models = {
    fusion: {
      modelId: 'fusion',
      modelName: 'Multi-Modal Spatial Fusion Model (CNN + XGBoost)',
      accuracy: 0.892,
      precision: 0.865,
      recall: 0.884,
      f1Score: 0.874,
      rocAuc: 0.924,
      prAuc: 0.898,
      validationScheme: 'Spatial block cross-validation (5-fold, 15km block size)',
      confusionMatrix: {
        labels: ['Non-Mineralized', 'Manganese Zone'],
        counts: [[1420, 145], [118, 917]],
        normalized: [[0.907, 0.093], [0.114, 0.886]],
      },
      rocCurve: [
        { fpr: 0.0, tpr: 0.0 },
        { fpr: 0.02, tpr: 0.35 },
        { fpr: 0.05, tpr: 0.68 },
        { fpr: 0.10, tpr: 0.84 },
        { fpr: 0.18, tpr: 0.91 },
        { fpr: 0.30, tpr: 0.96 },
        { fpr: 1.0, tpr: 1.0 },
      ],
      prCurve: [
        { recall: 0.0, precision: 1.0 },
        { recall: 0.4, precision: 0.95 },
        { recall: 0.7, precision: 0.89 },
        { recall: 0.88, precision: 0.86 },
        { recall: 1.0, precision: 0.42 },
      ],
      featureImportance: [
        { feature: 'Geological Host Formation', importance: 0.31 },
        { feature: 'Iron Oxide Spectral Ratio', importance: 0.26 },
        { feature: 'Fault Proximity & Lineaments', importance: 0.18 },
        { feature: 'DEM Slope & Elevation', importance: 0.15 },
        { feature: 'Historical Occurrence Distance', importance: 0.10 },
      ],
    },
    rf: {
      modelId: 'rf',
      modelName: 'Random Forest Prospectivity Baseline',
      accuracy: 0.841,
      precision: 0.812,
      recall: 0.835,
      f1Score: 0.823,
      rocAuc: 0.882,
      prAuc: 0.841,
      validationScheme: 'Spatial block cross-validation (demo)',
      confusionMatrix: {
        labels: ['Non-Mineralized', 'Manganese Zone'],
        counts: [[1380, 185], [170, 865]],
        normalized: [[0.882, 0.118], [0.164, 0.836]],
      },
      rocCurve: [
        { fpr: 0.0, tpr: 0.0 },
        { fpr: 0.05, tpr: 0.45 },
        { fpr: 0.12, tpr: 0.75 },
        { fpr: 0.25, tpr: 0.87 },
        { fpr: 1.0, tpr: 1.0 },
      ],
      prCurve: [
        { recall: 0.0, precision: 0.95 },
        { recall: 0.5, precision: 0.88 },
        { recall: 1.0, precision: 0.38 },
      ],
      featureImportance: [
        { feature: 'Geological Formation', importance: 0.35 },
        { feature: 'Spectral Features', importance: 0.25 },
        { feature: 'Terrain & DEM', importance: 0.20 },
        { feature: 'Historical Mines', importance: 0.20 },
      ],
    },
    xgb: {
      modelId: 'xgb',
      modelName: 'XGBoost Gradient Boosted Trees',
      accuracy: 0.875,
      precision: 0.848,
      recall: 0.868,
      f1Score: 0.858,
      rocAuc: 0.910,
      prAuc: 0.878,
      validationScheme: 'Spatial block cross-validation (demo)',
      confusionMatrix: {
        labels: ['Non-Mineralized', 'Manganese Zone'],
        counts: [[1405, 160], [135, 900]],
        normalized: [[0.898, 0.102], [0.130, 0.870]],
      },
      rocCurve: [
        { fpr: 0.0, tpr: 0.0 },
        { fpr: 0.03, tpr: 0.40 },
        { fpr: 0.08, tpr: 0.78 },
        { fpr: 0.20, tpr: 0.90 },
        { fpr: 1.0, tpr: 1.0 },
      ],
      prCurve: [
        { recall: 0.0, precision: 0.98 },
        { recall: 0.6, precision: 0.90 },
        { recall: 1.0, precision: 0.40 },
      ],
      featureImportance: [
        { feature: 'Spectral Features', importance: 0.32 },
        { feature: 'Geological Formation', importance: 0.29 },
        { feature: 'Lineaments', importance: 0.21 },
        { feature: 'Terrain', importance: 0.18 },
      ],
    },
    cnn: {
      modelId: 'cnn',
      modelName: 'ResNet-18 Deep Convolutional Remote Sensing Model',
      accuracy: 0.862,
      precision: 0.835,
      recall: 0.852,
      f1Score: 0.843,
      rocAuc: 0.895,
      prAuc: 0.860,
      validationScheme: 'Spatial block cross-validation (demo)',
      confusionMatrix: {
        labels: ['Non-Mineralized', 'Manganese Zone'],
        counts: [[1390, 175], [150, 885]],
        normalized: [[0.888, 0.112], [0.145, 0.855]],
      },
      rocCurve: [
        { fpr: 0.0, tpr: 0.0 },
        { fpr: 0.04, tpr: 0.42 },
        { fpr: 0.10, tpr: 0.76 },
        { fpr: 0.22, tpr: 0.88 },
        { fpr: 1.0, tpr: 1.0 },
      ],
      prCurve: [
        { recall: 0.0, precision: 0.96 },
        { recall: 0.55, precision: 0.87 },
        { recall: 1.0, precision: 0.39 },
      ],
      featureImportance: [
        { feature: 'Multi-Spectral Texture Patches', importance: 0.42 },
        { feature: 'Structural Lineament Density', importance: 0.28 },
        { feature: 'Elevation Surface Roughness', importance: 0.18 },
        { feature: 'Geological Boundary Masks', importance: 0.12 },
      ],
    },
  };

  return models[modelId] || models.fusion;
}

// 10. GROUND TRUTH VALIDATION RECORDS & VERSION HISTORY
export const GROUND_TRUTH_RECORDS: GroundTruthRecord[] = [
  {
    id: 'gt-01',
    zoneId: 'MN-047',
    zoneName: 'Keonjhar North-West Sector',
    predictedScore: 89,
    fieldOutcome: 'Confirmed High',
    drillHolesCount: 6,
    avgGradeFoundPct: 39.2,
    dateValidated: '2024-08-14',
  },
  {
    id: 'gt-02',
    zoneId: 'MN-023',
    zoneName: 'Joda South Extended Extension',
    predictedScore: 78,
    fieldOutcome: 'Confirmed High',
    drillHolesCount: 4,
    avgGradeFoundPct: 36.8,
    dateValidated: '2024-06-20',
  },
  {
    id: 'gt-03',
    zoneId: 'MN-012',
    zoneName: 'Barbil Deep Structural Trend',
    predictedScore: 92,
    fieldOutcome: 'Moderate Grade',
    drillHolesCount: 3,
    avgGradeFoundPct: 29.5,
    dateValidated: '2024-05-11',
  },
  {
    id: 'gt-04',
    zoneId: 'MN-105',
    zoneName: 'Bonai-Sundergarh Basin Sector B',
    predictedScore: 66,
    fieldOutcome: 'Validation Pending',
    drillHolesCount: 0,
    dateValidated: 'Pending Q4',
  },
];

export const MODEL_VERSION_HISTORY: ModelVersionHistory[] = [
  {
    version: 'v0.2-demo',
    date: '2024-09-15',
    datasetSize: 1450,
    rocAuc: 0.924,
    prAuc: 0.898,
    notes: 'Incorporated Sentinel-2 L2A BOA reflectance and GSI 1:50k updated structural lineaments.',
  },
  {
    version: 'v0.1-demo',
    date: '2024-04-10',
    datasetSize: 980,
    rocAuc: 0.885,
    prAuc: 0.842,
    notes: 'Initial multi-modal model trained on Landsat-8 and coarse regional GSI 1:250k geology.',
  },
];

// 11. DATA SOURCES CARDS
export const DATA_SOURCES: DataSourceItem[] = [
  {
    id: 'ds-01',
    name: 'Sentinel-2 A/B Multi-Spectral',
    category: 'Satellite Imagery',
    provider: 'ESA / Copernicus Open Access Hub',
    dataType: '13-band BOA Reflectance (10m–20m resolution)',
    updateFrequency: '5-day revisit cycle',
    lastSync: '2024-09-27 (24 scenes ingested)',
    coverage: 'Keonjhar, Sundergarh, Balaghat, Nagpur belts (100%)',
    role: 'Mandatory',
    status: 'CONNECTED',
    extractedFeatures: ['Iron-Oxide Ratio (B4/B2)', 'Clay Mineral Index (B11/B12)', 'Laterite Mask', 'Band 8A NIR Vegetation Normalization'],
    description: 'Provides high-resolution multi-spectral bands critical for surface oxide hydrothermal alteration mapping.',
  },
  {
    id: 'ds-02',
    name: 'Bhukosh GSI Spatial Geological Maps',
    category: 'Geological Maps',
    provider: 'Geological Survey of India (GSI)',
    dataType: 'Vector Shapefiles (1:50,000 scale lithology)',
    updateFrequency: 'Bi-annual release',
    lastSync: '2024-07-15',
    coverage: 'Central and Eastern Indian Manganese Provinces',
    role: 'Mandatory',
    status: 'CONNECTED',
    extractedFeatures: ['Host Formation Polygon Masks', 'Stratigraphic Contact Distance', 'Fault/Shear Lineament Density'],
    description: 'Defines target manganese host lithologies including Mansar formation schists and BHQ/BIF supergroups.',
  },
  {
    id: 'ds-03',
    name: 'Copernicus 30m Global DEM',
    category: 'DEM',
    provider: 'ESA / DLR',
    dataType: 'Digital Elevation Model (30m raster)',
    updateFrequency: 'Static baseline with annual updates',
    lastSync: '2024-01-10',
    coverage: 'Pan-India Coverage',
    role: 'Mandatory',
    status: 'CONNECTED',
    extractedFeatures: ['Elevation (m)', 'Slope Angle (deg)', 'Terrain Aspect', 'Drainage Density Index'],
    description: 'Provides topographic and morphometric features for geomorphological and accessibility scoring.',
  },
  {
    id: 'ds-04',
    name: 'IBM Indian Mines Bureau Production Statistics',
    category: 'Production Data',
    provider: 'Indian Bureau of Mines (IBM) / Ministry of Mines',
    dataType: 'Monthly Mine-Level Production & Grade Returns',
    updateFrequency: 'Monthly returns',
    lastSync: '2024-09-01',
    coverage: 'All operating captive and non-captive Mn leases',
    role: 'Mandatory',
    status: 'CONNECTED',
    extractedFeatures: ['Historical Mine Monthly Tonnage', 'Run-of-Mine Grade % Mn', 'Dispatches & Stockpile Levels'],
    description: 'Feeds historical baseline production trends and forecast calibration algorithms.',
  },
  {
    id: 'ds-05',
    name: 'NGCM Geochemical Stream Sediment Ingestion',
    category: 'Geochemical Data',
    provider: 'National Geophysical Research Institute / GSI',
    dataType: 'Point Geochemistry Samples (XRF Mn ppm)',
    updateFrequency: 'Batch updates on field survey completion',
    lastSync: 'In Processing Queue',
    coverage: 'Balaghat-Bhandara quadrangle (partial 65%)',
    role: 'Optional',
    status: 'PROCESSING',
    extractedFeatures: ['Mn Element Concentration (ppm)', 'Fe/Mn Ratio', 'Trace Metal Anomalies'],
    description: 'Stream sediment sample analysis providing ground-truth geochemical anomaly validation.',
  },
  {
    id: 'ds-06',
    name: 'Airborne Magnetic & Gamma Spectroscopy',
    category: 'Mining Data',
    provider: 'GSI National Aero-geophysical Mapping Programme',
    dataType: 'Radiometric & Aeromagnetic Raster Grids',
    updateFrequency: 'On-demand survey release',
    lastSync: 'Pending Licensing Integration',
    coverage: 'Sundergarh Basin (30%)',
    role: 'Optional',
    status: 'NOT CONNECTED',
    extractedFeatures: ['Potassium/Thorium Ratio', 'Total Magnetic Intensity Anomaly'],
    description: 'High-resolution subsurface structural mapping for deep-seated manganese deposit detection.',
  },
];

// 12. SYSTEM STATUS POWEROVER SERVICES
export const SYSTEM_SERVICES_STATUS: SystemServiceStatus[] = [
  { name: 'Satellite Ingestion Pipeline', status: 'CONNECTED', latencyMs: 140, details: 'Sentinel-2 & Landsat-9 streams synced.' },
  { name: 'AI Prospectivity Model Service', status: 'CONNECTED', latencyMs: 45, details: 'Inference engine v0.2-demo online (GPU accelerated).' },
  { name: 'Spatial GeoJSON Data Store', status: 'CONNECTED', latencyMs: 18, details: 'PostGIS / MapLibre vector source healthy.' },
  { name: 'Ministry of Steel API Gateway', status: 'PROCESSING', latencyMs: 310, details: 'Syncing Q3 monthly production returns.' },
];
