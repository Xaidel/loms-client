import Papa from "papaparse";
import { CO, COAEP } from "../types/coaep";
import { performaceTarget } from "../helper/performaceTarget.helper";
import getCoaepHeader from "../helper/header-getter/getCoaepHeader";
import extractFromObjective from "../helper/extractFromObjective.helper";

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

  // DYNAMICALLY FIND HEADERS
  const { headerRowIndex, coIdx, iloIdx, assessToolIdx, perfTargetIdx } =
    getCoaepHeader(rows);

  // Validation: If headers aren't found, you might want to throw an error or use defaults
  if (headerRowIndex === -1) {
    return {
      error: "Could not auto-detect header row.",
      message: "Please ensure the CSV file is in the correct COAEP format.",
    };
  }

  // Get Faculty, School Year, Course, Semester info from the file
  rows.forEach((row) => {
    const facName = row.indexOf("Name of Faculty:");
    const schoolYear = row.indexOf("School Year");
    const courseIdx = row.indexOf("Course:");
    const semesterIdx = row.indexOf("Semester");

    if (facName !== -1) {
      data.COAEP.faculty = row[facName + 1]?.trim() || data.COAEP.faculty;
    }
    if (schoolYear !== -1) {
      data.COAEP.sy = row[schoolYear + 1]?.trim() || data.COAEP.sy;
    }
    if (courseIdx !== -1) {
      data.COAEP.course = row[courseIdx + 1]?.trim() || data.COAEP.course;
    }
    if (semesterIdx !== -1) {
      const semStr = row[semesterIdx + 1]?.trim() || "";
      const semNum = semStr.match(/\d+/)?.[0];
      data.COAEP.semester = semNum ? parseInt(semNum, 10) : data.COAEP.semester;
    }
  });

  let currentCO: CO | null = null;

  rows.forEach((row, rowIndex) => {
    // Skip rows before or at the header row
    if (rowIndex <= headerRowIndex) return;

    // Try to find CO Number and Statement - check both possible formats
    // Format 1: CO Number at coIdx-1, CO Statement at coIdx
    // Format 2: CO Number at coIdx, CO Statement at coIdx+1
    let coNum = row[coIdx - 1]?.trim() || "";
    let coState = row[coIdx]?.trim() || "";

    // If coIdx contains a number, use format 2
    if (/^\d+$/.test(row[coIdx]?.trim() || "")) {
      coNum = row[coIdx]?.trim() || "";
      coState = row[coIdx + 1]?.trim() || "";
    }

    const iloState = row[iloIdx]?.trim() || "";
    const assessmentTool =
      row[assessToolIdx]?.replace(/^ILO\d+[:.]?\s*/, "").trim() || "";
    const perfTargetStr = row[perfTargetIdx]?.replace(/\s+/g, " ").trim() || "";

    if (coNum && /^\d+$/.test(coNum)) {
      if (currentCO) {
        data.COAEP.co.push(currentCO);
      }
      const stmt = coState;
      const { verb, cognitive_level, taxonomy_level } =
        extractFromObjective(stmt);
      currentCO = {
        statement: stmt,
        ilo: [],
        verb: verb,
        cognitive_level: cognitive_level,
        taxonomy_level: taxonomy_level,
      };
    }

    if (currentCO && iloState && perfTargetStr) {
      const iloStatement = iloState.replace(/^ILO\d+[:.]?\s*/, "");

      // Skip footer/metadata rows (like "Revision No:", "Prepared by:", etc.)
      if (
        iloStatement.match(
          /^(Revision|Prepared|Date|Approved|Effectivity|Page)/i,
        ) ||
        iloStatement.length < 10
      ) {
        return;
      }

      // Extract assessment tool from ILO statement if not in separate column
      let finalAssessmentTool = assessmentTool;
      if (!finalAssessmentTool && iloStatement.includes(":")) {
        const match = iloStatement.match(/^ILO\d+:\s*(.+?)(?:\s*\(|$)/);
        if (match) {
          finalAssessmentTool = match[1]?.trim() || "";
        }
      }

      const { performance_target, passing_score } =
        performaceTarget(perfTargetStr);

      const { verb, cognitive_level, taxonomy_level } =
        extractFromObjective(iloStatement);

      currentCO.ilo.push({
        statement: iloStatement,
        assessment_tool: finalAssessmentTool,
        performance_target,
        passing_score,
        verb: verb,
        cognitive_level: cognitive_level,
        taxonomy_level: taxonomy_level,
      });
    }
  });

  if (currentCO) {
    data.COAEP.co.push(currentCO);
  }

  return data;
}
