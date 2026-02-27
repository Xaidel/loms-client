import Taxonomy from "./Taxonomy";

export interface POAEP {
  po: PO[];
}

export interface PO {
  po_desc: string;
  seq_no: number;
  PerfIndicators: PerfIndicator[];
}

export interface PerfIndicator {
  pi_desc: string;
  FormativeCourses: PIFormative[];
  SummativeCourse: PISummative;
  TaxonomyLevel: PITaxonomyLevel | null;
  AssessmentTool: PIAssessmentTool;
  PerformanceTargets: PIPerfTarget;
}

// changes with curri_id

export interface PIFormative {
  course_id: string;
  cognitive_level: number | null;
}

export interface PISummative {
  course_id: string;
}

export interface PIAssessmentTool {
  at_desc: string;
}

export interface PIPerfTarget {
  target_percent: number;
  min_score: number;
}

export interface PITaxonomyLevel {
  label: Taxonomy;
}
