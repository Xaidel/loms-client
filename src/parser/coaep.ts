import Papa from "papaparse";
import { CO, COAEP } from "../types/coaep";
import { performaceTarget } from "../helper/matchTarget";

export function parseCOAEP(csvString: string) {
  const rows: string[][] = Papa.parse<string[]>(csvString, {
    skipEmptyLines: false
  }).data as string[][];

  const data: { COAEP: COAEP } = {
    COAEP: {
      faculty: null,
      course: null,
      sy: null,
      semester: null,
      co: []
    }
  };

  rows.forEach(row => {
    if (row[1]?.includes("Name of Faculty:")) {
      data.COAEP.faculty = row[2]?.trim() || null;
    }
    if (row.includes("School Year")) {
      const idx = row.indexOf("School Year");
      data.COAEP.sy = row[idx + 1]?.trim() || null;
    }
    if (row[1]?.includes("Course:")) {
      const courseStr = row[2]?.trim() || "";
      data.COAEP.course = courseStr || null;
    }
    if (row.includes("Semester")) {
      const idx = row.indexOf("Semester");
      const semStr = row[idx + 1]?.trim() || "";
      const semNum = semStr.match(/\d+/)?.[0];
      data.COAEP.semester = semNum ? parseInt(semNum, 10) : null;
    }
  });

  let currentCO: CO | null = null;

  rows.forEach(row => {
    const col0 = row[0]?.trim() || "";
    const col1 = row[1]?.trim() || "";
    const col3 = row[3]?.trim() || "";

    if (col0 && /^\d+$/.test(col0)) {
      if (currentCO) {
        data.COAEP.co.push(currentCO);
      }
      const stmt = col1
      const verb = stmt.trim().split(/\s+/)[0] ?? "";
      currentCO = {
        statement: stmt,
        verb: verb,
        ilo: []
      };
    }

    if (currentCO && col3) {
      const iloStatement = col3
        .replace(/^ILO\d+\s*/, "")
        .replace(/\s+/g, " ")
        .trim();

      const assessmentTool = (row[4]?.replace(/\s+/g, " ").trim()) || "";
      const perfTargetStr = (row[5]?.replace(/\s+/g, " ").trim()) || "";

      const { performance_target, passing_score } = performaceTarget(perfTargetStr)

      currentCO.ilo.push({
        statement: iloStatement,
        verb: iloStatement.split(/\s+/)[0] ?? "",
        assessment_tool: assessmentTool,
        performance_target,
        passing_score
      });
    }
  });

  if (currentCO) {
    data.COAEP.co.push(currentCO);
  }

  return data;
}
