import { Feature, FeatureCollection, Polygon, Point, LineString } from 'geojson';

export type ProspectivityStatus = 'high' | 'medium' | 'low';
export type AccessibilityLevel = 'Excellent' | 'Moderate' | 'Challenging' | 'Remote';
export type TerrainDifficulty = 'Low' | 'Moderate' | 'High';
export type PriorityTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export interface ConfidenceComponents {
  modelAgreement: number; // 0-100
  featureCoverage: number; // 0-100
  dataQuality: number; // 0-100
}

export interface ShapContributions {
  geology: number;
  spectral: number;
  terrain: number;
  lineaments: number;
  historical: number;
}

export interface SpectralIndicators {
  ironOxideRatio: number;
  clayIndex: number;
  lateriteIndex: number;
}

export interface GeologicalIndicators {
  hostFormation: string;
  distToContactKm: number;
  faultProximityKm: number;
}

export interface TerrainIndicators {
  elevationM: number;
  slopeDeg: number;
  drainageDensity: number;
}

export interface ResourceEstimate {
  p10: number; // Million Tonnes
  p50: number; // Million Tonnes
  p90: number; // Million Tonnes
  thicknessM: number; // meters
  densityTm3: number; // t/m³
  oreFactor: number; // 0-1 fraction
  gradePct: number; // % Mn
}

export interface ZoneProperties {
  id: string; // e.g. "MN-047"
  name: string;
  district: string;
  regionId: string;
  prospectivityScore: number; // 0-100
  confidence: number; // 0-100
  confidenceComponents: ConfidenceComponents;
  areaKm2: number;
  status: ProspectivityStatus;
  accessibility: AccessibilityLevel;
  accessibilityScore: number; // 0-1
  terrainDifficulty: TerrainDifficulty;
  explorationCostIndex: number; // 0-100
  shap: ShapContributions;
  spectral: SpectralIndicators;
  geological: GeologicalIndicators;
  terrain: TerrainIndicators;
  resource: ResourceEstimate;
  priorityScore: number; // 0-100
  priorityTier: PriorityTier;
  recommendedAction: string;
  recommendedActionReason: string;
  nearestOccurrenceKm: number;
  timeToSupplyYears: number;
  centerCoordinate: [number, number]; // [lng, lat]
}

export type ZoneFeature = Feature<Polygon, ZoneProperties>;
export type ZoneCollection = FeatureCollection<Polygon, ZoneProperties>;

export interface ProspectivityPointProperties {
  score: number; // 0-100
  zoneId?: string;
}
export type ProspectivityPointCollection = FeatureCollection<Point, ProspectivityPointProperties>;

export interface MineProperties {
  id: string;
  name: string;
  district: string;
  type: 'Operating Mine' | 'Historical Deposit' | 'Occurence';
  annualProductionMt?: number;
  gradePct: number;
}
export type MineCollection = FeatureCollection<Point, MineProperties>;

export interface GeologyProperties {
  id: string;
  formationName: string;
  lithology: string;
  age: string;
  colorHex: string;
}
export type GeologyCollection = FeatureCollection<Polygon, GeologyProperties>;

export interface LineamentProperties {
  id: string;
  type: 'Fault' | 'Shear Zone' | 'Fracture';
  lengthKm: number;
}
export type LineamentCollection = FeatureCollection<LineString, LineamentProperties>;

export interface RoadProperties {
  id: string;
  name: string;
  type: 'National Highway' | 'State Highway' | 'Mining Haul Road';
}
export type RoadCollection = FeatureCollection<LineString, RoadProperties>;

export interface MonthlyProductionPoint {
  month: string; // "2023-01"
  label: string; // "Jan 23"
  isHistorical: boolean;
  actualProductionMt?: number;
  forecastP50Mt?: number;
  forecastP10Mt?: number;
  forecastP90Mt?: number;
  demandMt: number;
  shortfallMt: number;
}

export interface ProductionForecastResponse {
  horizonMonths: 3 | 6 | 12;
  model: string;
  series: MonthlyProductionPoint[];
  summary: {
    cumulativeHistoricalMt: number;
    cumulativeForecastMt: number;
    cumulativeDemandMt: number;
    cumulativeShortfallMt: number;
    keyDriversText: string;
  };
}

export interface ShortfallDriver {
  id: string;
  category: 'Production Capacity' | 'Ore Grade' | 'Mine Availability' | 'Operational Constraints' | 'Demand Growth';
  title: string;
  impactMagnitude: number; // 1-10 scale
  impactDirection: 'Negative' | 'Positive';
  explanation: string;
  tooltip: string;
}

export interface PriorityWeights {
  wProspectivity: number;
  wConfidence: number;
  wResourcePotential: number;
  wAccessibility: number;
  wCost: number;
}

export interface ModelPerformanceMetrics {
  modelId: string;
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  validationScheme: string;
  confusionMatrix: {
    labels: string[];
    counts: number[][]; // 2x2 matrix
    normalized: number[][];
  };
  rocCurve: { fpr: number; tpr: number }[];
  prCurve: { recall: number; precision: number }[];
  featureImportance: { feature: string; importance: number }[];
}

export interface GroundTruthRecord {
  id: string;
  zoneId: string;
  zoneName: string;
  predictedScore: number;
  fieldOutcome: 'Confirmed High' | 'Moderate Grade' | 'Barren / Unconfirmed' | 'Validation Pending';
  drillHolesCount: number;
  avgGradeFoundPct?: number;
  dateValidated: string;
}

export interface ModelVersionHistory {
  version: string;
  date: string;
  datasetSize: number;
  rocAuc: number;
  prAuc: number;
  notes: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  category: 'Satellite Imagery' | 'Geological Maps' | 'DEM' | 'Mining Data' | 'Production Data' | 'Geochemical Data';
  provider: string;
  dataType: string;
  updateFrequency: string;
  lastSync: string;
  coverage: string;
  role: 'Mandatory' | 'Optional';
  status: 'CONNECTED' | 'PROCESSING' | 'NOT CONNECTED';
  extractedFeatures: string[];
  description: string;
}

export interface SystemServiceStatus {
  name: string;
  status: 'CONNECTED' | 'PROCESSING' | 'NOT CONNECTED';
  latencyMs: number;
  details: string;
}

export type DataMode = 'demo' | 'live';
