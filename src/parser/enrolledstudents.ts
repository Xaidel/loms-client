import Papa from "papaparse";

export type enrolledStudentsCsvRow = {
  dept_id: string;
  student_no: string;
  name: string;
  curriculum_id: string;
  year_level: number;
};

export const parseEnrolledStudents = (csvData: string) => {
  const parsed = Papa.parse<enrolledStudentsCsvRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  return {
    enrolledStudents: parsed.data as enrolledStudentsCsvRow[],
  };
};
