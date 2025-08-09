export interface CurriculumCourses {
  curr_id: string;
  program_name: string;
  revision_no: number;
  year_level: number;
  sem: number;
  course_id: string;
  course_desc: string;
  total_units?: string;
  lec_unit?: string;
  lab_unit?: string;
}