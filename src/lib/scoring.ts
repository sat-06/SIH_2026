import {
  PriorityWeights,
  ProspectivityStatus,
  PriorityTier,
  AccessibilityLevel,
} from '../types/domain';

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  wProspectivity: 0.30,
  wConfidence: 0.20,
  wResourcePotential: 0.20,
  wAccessibility: 0.15,
  wCost: 0.15,
};

export function renormalizeWeights(weights: PriorityWeights): PriorityWeights {
  const sum =
    weights.wProspectivity +
    weights.wConfidence +
    weights.wResourcePotential +
    weights.wAccessibility +
    weights.wCost;

  if (sum <= 0) return DEFAULT_PRIORITY_WEIGHTS;

  return {
    wProspectivity: Math.round((weights.wProspectivity / sum) * 100) / 100,
    wConfidence: Math.round((weights.wConfidence / sum) * 100) / 100,
    wResourcePotential: Math.round((weights.wResourcePotential / sum) * 100) / 100,
    wAccessibility: Math.round((weights.wAccessibility / sum) * 100) / 100,
    wCost: Math.round((weights.wCost / sum) * 100) / 100,
  };
}

export function accessibilityToScore(level: AccessibilityLevel): number {
  switch (level) {
    case 'Excellent':
      return 1.0;
    case 'Moderate':
      return 0.75;
    case 'Challenging':
      return 0.45;
    case 'Remote':
      return 0.2;
    default:
      return 0.5;
  }
}

export function computeEPS(
  prospectivityScore: number, // 0-100
  confidence: number, // 0-100
  resourceP50Mt: number,
  accessibilityScore: number, // 0-1
  explorationCostIndex: number, // 0-100
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): number {
  // Normalise inputs to 0-1
  const normProspectivity = Math.min(1, Math.max(0, prospectivityScore / 100));
  const normConfidence = Math.min(1, Math.max(0, confidence / 100));
  // Resource normalized assuming max realistic zone potential of 20 Mt
  const normResource = Math.min(1, Math.max(0, resourceP50Mt / 20));
  const normAccess = Math.min(1, Math.max(0, accessibilityScore));
  const normCost = Math.min(1, Math.max(0, explorationCostIndex / 100));

  const weightedSum =
    weights.wProspectivity * normProspectivity +
    weights.wConfidence * normConfidence +
    weights.wResourcePotential * normResource +
    weights.wAccessibility * normAccess -
    weights.wCost * normCost;

  // Scale to 0-100 and clamp
  const score = Math.round(Math.min(100, Math.max(0, weightedSum * 100)));
  return score;
}

export function getPriorityTier(epsScore: number): PriorityTier {
  if (epsScore >= 70) return 'Tier 1';
  if (epsScore >= 40) return 'Tier 2';
  return 'Tier 3';
}

export function getProspectivityStatus(prospectivityScore: number): ProspectivityStatus {
  if (prospectivityScore >= 75) return 'high';
  if (prospectivityScore >= 50) return 'medium';
  return 'low';
}

export interface ActionRecommendation {
  action: string;
  reasonText: string;
}

export function getRecommendedAction(
  prospectivityScore: number,
  confidence: number,
  epsScore: number,
  costIndex: number,
  accessLevel: AccessibilityLevel
): ActionRecommendation {
  if (epsScore >= 68 && confidence >= 60) {
    return {
      action: 'Field validation recommended',
      reasonText: `High Exploration Priority Score (${epsScore}) with solid model confidence (${confidence}%) justifies immediate surface mapping and trenching.`,
    };
  } else if (prospectivityScore >= 65 && confidence < 60) {
    return {
      action: 'Further remote sensing analysis',
      reasonText: `Promising prospectivity (${prospectivityScore}%), but lower confidence (${confidence}%) requires hyperspectral refine & geophysical verification before ground deployment.`,
    };
  } else if (costIndex > 75 || accessLevel === 'Remote') {
    return {
      action: 'Low priority for immediate investigation',
      reasonText: `High exploration cost index (${costIndex}) or remote terrain limits short-term feasibility despite raw geological signature.`,
    };
  } else {
    return {
      action: 'Low priority for immediate investigation',
      reasonText: `Moderate prospectivity (${prospectivityScore}%) and EPS (${epsScore}) place this zone in secondary evaluation batch.`,
    };
  }
}

export function calculateShortfall(demand: number, supply: number): number {
  return Math.max(0, Math.round((demand - supply) * 100) / 100);
}
