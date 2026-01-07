//   provided:
// curr_id
// period_id
// program_id

export interface PO {
  po_description: string;
  seq_no: number;
  status: number;
  is_active: boolean;
  // program_id: number;
}

export interface PerfIndicator {
  pi_id: number;
  pi_description: string;
  status: number;
  is_active: boolean;
  po_id: number;
}

// changes with curri_id

export interface PIFormative {
  fc_id: number;
  pi_id: number;
  course_id: number;
  cognitive_level: number;
  // curr_id: string;
}

export interface PISummative {
  pi_summ_id: number;
  pi_id: number;
  course_id: number;
  status: number;
  // curr_id: string;
}

// changes with period_id

export interface PIPerfTarget {
  ppt_id: number;
  pi_id: number;
  target_percent: number;
  min_score: number;
  // period_id: number;
  // curr_id: string;
}
