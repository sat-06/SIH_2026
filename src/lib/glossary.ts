export interface GlossaryItem {
  term: string;
  definition: string;
  contextNote?: string;
}

export const GLOSSARY: Record<string, GlossaryItem> = {
  Prospectivity: {
    term: 'Prospectivity',
    definition:
      'The relative AI-predicted likelihood (0–100%) that a spatial unit contains manganese mineralization based on geological, spectral, and geophysical feature alignment.',
    contextNote: 'Model prediction output. Does not confirm physical presence of ore.',
  },
  Confidence: {
    term: 'Confidence Score',
    definition:
      'An aggregated measure evaluating multi-model spatial agreement, training feature-space density coverage, and input data quality across the target zone.',
    contextNote: 'High prospectivity with low confidence indicates high uncertainty.',
  },
  'AI-estimated potential resource': {
    term: 'AI-Estimated Potential Resource',
    definition:
      'Preliminary tonnage range (P10–P90) calculated from estimated spatial area, prospective fraction, inferred seam thickness, and analogue bulk density.',
    contextNote: 'Strictly preliminary. NOT a certified mineral reserve.',
  },
  'Exploration Priority Score': {
    term: 'Exploration Priority Score (EPS)',
    definition:
      'A multi-criteria decision metric (0–100) weighting prospectivity, confidence, potential tonnage, accessibility, and inverse exploration cost index.',
    contextNote: 'Used by exploration decision makers to rank field validation targets.',
  },
  SHAP: {
    term: 'SHAP (SHapley Additive exPlanations)',
    definition:
      'A game-theoretic method for explaining ML model predictions by quantifying how much each individual feature (geology, spectral, terrain) pulled the prospectivity score up or down.',
    contextNote: 'Explains model logic, not physical geological causation.',
  },
  'PR-AUC': {
    term: 'PR-AUC (Precision-Recall Area Under Curve)',
    definition:
      'A robust evaluation metric for imbalanced spatial datasets measuring precision versus recall across decision thresholds.',
    contextNote: 'Superior to raw accuracy on rare mineral deposit prediction.',
  },
  'ROC-AUC': {
    term: 'ROC-AUC',
    definition:
      'Area Under the Receiver Operating Characteristic Curve, measuring the model capability to distinguish mineralized zones from unmineralized background.',
  },
  'Ore Factor': {
    term: 'Ore Factor',
    definition:
      'The fraction (0–1) of host formation geometry that is expected to carry economic-grade ore rather than barren rock.',
  },
  'Spatial Block CV': {
    term: 'Spatial Block Cross-Validation',
    definition:
      'A validation methodology that spatially segregates training and validation folds to prevent spatial autocorrelation data leakage.',
  },
};
