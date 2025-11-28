import Papa from "papaparse";
import { CO, COAEP } from "../types/coaep";
import { performaceTarget } from "../helper/performaceTarget.helper";
import extractInstructionalVerb from "../helper/extractInstructionalVerb.helper";

export function parseCOAEP(csvString: string) {
  const rows: string[][] = Papa.parse<string[]>(csvString, {
    skipEmptyLines: false,
  }).data as string[][];

  const data: { COAEP: COAEP } = {
    COAEP: {
      faculty: null,
      course: null,
      sy: null,
      semester: null,
      co: [],
    },
  };

  let coIdx = -1;
  let iloIdx = -1;
  let assessToolIdx = -1;
  let perfTargetIdx = -1;

  // Get index in row of every header
  rows.forEach((row) => {
    coIdx = row.indexOf("Course Outcome Statement");
    iloIdx = row.indexOf("Intended Learning Outcome");
    assessToolIdx = row.indexOf("Assessment Tool");
    perfTargetIdx = row.indexOf("Performance Target");

    if (
      coIdx !== -1 &&
      iloIdx !== -1 &&
      assessToolIdx !== -1 &&
      perfTargetIdx !== -1
    ) {
      return;
    }
  });

  // Get Faculty, School Year, Course, Semester info from the file
  rows.forEach((row) => {
    const facName = row.indexOf("Name of Faculty:");
    const schoolYear = row.indexOf("School Year");
    const courseIdx = row.indexOf("Course:");
    const semesterIdx = row.indexOf("Semester");

    data.COAEP.faculty = row[facName + 1]?.trim() || data.COAEP.faculty;
    data.COAEP.sy = row[schoolYear + 1]?.trim() || data.COAEP.sy;
    data.COAEP.course = row[courseIdx + 1]?.trim() || data.COAEP.course;

    const semStr = row[semesterIdx + 1]?.trim() || "";
    const semNum = semStr.match(/\d+/)?.[0];
    data.COAEP.semester = semNum ? parseInt(semNum, 10) : data.COAEP.semester;
  });

  let currentCO: CO | null = null;

  rows.forEach((row) => {
    const coNum = row[coIdx]?.trim() || ""; // coIdx is the CO Number
    const coState = row[coIdx + 1]?.trim() || ""; // coIdx is the CO Statement
    const iloState = row[iloIdx]?.trim() || ""; // iloIdx is the ILO Statement
    const assessmentTool =
      row[assessToolIdx]?.replace(/^ILO\d+[:.]?\s*/, "") || "";
    const perfTargetStr = row[perfTargetIdx]?.replace(/\s+/g, " ").trim() || "";

    if (
      coNum === "" &&
      coState === "" &&
      iloState === "" &&
      assessmentTool === "" &&
      perfTargetStr === ""
    ) {
      return;
    }

    if (coNum && /^\d+$/.test(coNum)) {
      if (currentCO) {
        data.COAEP.co.push(currentCO);
      }
      const stmt = coState;
      const verb = extractInstructionalVerb(stmt) || "";
      currentCO = {
        statement: stmt,
        verb: verb,
        ilo: [],
      };
    }

    if (currentCO && iloState) {
      const iloStatement = iloState.replace(/^ILO\d+[:.]?\s*/, "");

      const { performance_target, passing_score } =
        performaceTarget(perfTargetStr);

      currentCO.ilo.push({
        statement: iloStatement,
        verb: extractInstructionalVerb(iloStatement) || "",
        assessment_tool: assessmentTool,
        performance_target,
        passing_score,
      });
    }
  });

  if (currentCO) {
    data.COAEP.co.push(currentCO);
  }

  return data;
}
