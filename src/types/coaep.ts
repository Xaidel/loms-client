export interface ILO {
  statement: string;
  verb: string;
  assessment_tool: string;
  performance_target: number | null;
  passing_score: number | null;
}

export interface CO {
  statement: string;
  verb: string;
  ilo: ILO[];
}

export interface COAEP {
  faculty: string | null;
  course: string | null;
  sy: string | null;
  semester: number | null;
  co: CO[];
}
