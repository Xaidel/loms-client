export interface ILO {
  statement: string;
  assessment_tool: string;
  performance_target: number | null;
  passing_score: number | null;

  taxonomy_level: string | null;
  cognitive_level: "I" | "E" | "D" | null;
  verb: string | null;
}

export interface CO {
  statement: string;
  ilo: ILO[];

  taxonomy_level: string | null;
  cognitive_level: "I" | "E" | "D" | null;
  verb: string | null;
}

export interface COAEP {
  faculty: string | null;
  course: string | null;
  sy: string | null;
  semester: number | null;
  co: CO[];
}
