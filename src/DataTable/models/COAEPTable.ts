import Papa from "papaparse";
import { CO, COAEP, ILO } from "../../types/coaep";
import { DataTable, DataTableInfo } from "./DataTable";
import { ParserResult } from "../types/ParserResult";
import getCoaepHeader from "../../helper/header-getter/getCoaepHeader";
import DataTableException from "../types/DataTableException";
import extractFromObjective from "../../helper/extractFromObjective.helper";
import { performaceTarget } from "../../helper/performaceTarget.helper";

export class COAEPDataTable extends DataTable<{ COAEP: COAEP }> {
  faculty: string | null = null;
  course: string | null = null;
  sy: string | null = null;
  semester: number | null = null;

  constructor() {
    super();
    this.name = "COAEP DataTable";
  }

  async fromCSVString(csvString: string): Promise<ParserResult<DataTableInfo>> {
    try {
      const info = {
        name: this.name,
        table: [],
        headers: [],
        types: [],
      } as DataTableInfo;

      const rows: string[][] = Papa.parse<string[]>(csvString, {
        skipEmptyLines: false,
      }).data as string[][];

      info.headers = [
        "No.",
        "Course Outcome Statement",
        "Intended Learning Outcome",
        "Assessment Tool",
        "Performance Target",
      ];

      const { headerRowIndex, coIdx, iloIdx, assessToolIdx, perfTargetIdx } =
        getCoaepHeader(rows);

      // Validation: If headers aren't found, you might want to throw an error or use defaults
      if (headerRowIndex === -1)
        throw new Error(
          "Could not auto-detect header row. Please ensure the CSV file is in the correct COAEP format.",
        );

      // Get Faculty, School Year, Course, Semester info from the file
      rows.forEach((row) => {
        const facName = row.indexOf("Name of Faculty:");
        const schoolYear = row.indexOf("School Year");
        const courseIdx = row.indexOf("Course:");
        const semesterIdx = row.indexOf("Semester");

        if (facName !== -1) {
          this.faculty = row[facName + 1]?.trim() || this.faculty;
        }
        if (schoolYear !== -1) {
          this.sy = row[schoolYear + 1]?.trim() || this.sy;
        }
        if (courseIdx !== -1) {
          this.course = row[courseIdx + 1]?.trim() || this.course;
        }
        if (semesterIdx !== -1) {
          const semStr = row[semesterIdx + 1]?.trim() || "";
          const semNum = semStr.match(/\d+/)?.[0];
          this.semester = semNum ? parseInt(semNum, 10) : this.semester;
        }
      });

      for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
        const row = rows[rowIndex];
        if (!row) break;

        if (rowIndex <= headerRowIndex) continue;

        let coNum = row[coIdx - 1]?.trim() || "";
        let coState = row[coIdx]?.trim() || "";

        // If coIdx contains a number, use format 2
        if (/^\d+$/.test(row[coIdx]?.trim() || "")) {
          coNum = row[coIdx]?.trim() || "";
          coState = row[coIdx + 1]?.trim() || "";
        }

        if (row[iloIdx])
          info.table.push([
            coNum,
            coState,
            row[iloIdx]?.trim() || "",
            row[assessToolIdx]?.replace(/^ILO\d+[:.]?\s*/, "").trim() || "",
            row[perfTargetIdx]?.replace(/\s+/g, " ").trim() || "",
          ]);
        else break;
      }

      return {
        success: true,
        message: "Successfully converted COAEP datatable.",
        data: info,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error parsing COAEP table",
        error: error,
      } as ParserResult;
    }
  }

  async validate(): Promise<
    ParserResult<{ validMsgs: string[]; tableErrors: DataTableException[] }>
  > {
    try {
      const tableErrors: DataTableException[] = [];
      const validMsgs: string[] = [];
      this.assertInitialized()
        .then((msg: string) => {
          validMsgs.push(msg);
        })
        .catch((error: DataTableException) => tableErrors.push(error));

      // insert more asserts here

      let msg = "Successfully validated COAEP datatable.";
      if (validMsgs.length) {
        msg += ` Passed ${validMsgs.length} validations.`;
      }
      if (tableErrors.length) {
        msg += ` Found ${tableErrors.length} errors.`;
      }

      return {
        success: true,
        message: msg,
        data: {
          validMsgs,
          tableErrors,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Error validating COAEP datatable.",
        error: error,
      } as ParserResult;
    }
  }

  async toJson(): Promise<ParserResult<{ COAEP: COAEP }>> {
    const tableErrors: DataTableException[] = [];
    try {
      await this.assertInitialized();

      const COAEP = {
        faculty: this.faculty,
        course: this.course,
        sy: this.sy,
        semester: this.semester,
        co: [],
      } as COAEP;

      let currentCO: CO | null = null;
      let lastAT = "";
      let lastPT = "";

      this.table.forEach((row, i) => {
        // if empty co statement at first row, push error
        if (i === 0 && !row[1])
          tableErrors.push({
            error: "Cannot have empty CO Statement in first row.",
            row: 0,
            column: 1,
          });

        // if new CO, flush stored values
        if (row[1]) {
          lastAT = "";
          lastPT = "";
        }

        // fetch row data
        const co = row[1] as string | null;
        const ilo = row[2] as string;
        const assessTool = (row[3] || lastAT) as string;
        const perfTarget = (row[4] || lastPT) as string;

        // if empty ilo, push error
        if (!ilo)
          tableErrors.push({
            error: "Cannot have empty ILO.",
            row: 1,
            column: 2,
          });

        // if empty assessTool, push error
        if (!assessTool)
          tableErrors.push({
            error: "Cannot have empty Assessment Tool.",
            row: i,
            column: 3,
          });

        // if empty perfTarget, push error
        if (!perfTarget)
          tableErrors.push({
            error: "Cannot have empty Performance Target.",
            row: i,
            column: 4,
          });

        // if new co, generate new co
        if (row[1]) {
          const { cognitive_level, taxonomy_level, verb } =
            extractFromObjective(co!);

          const newCO = {
            statement: co,
            ilo: [],
            taxonomy_level,
            cognitive_level,
            verb,
          } as CO;

          currentCO = newCO;
          COAEP.co.push(newCO);
        }

        const {
          cognitive_level: iloCognitiveLevel,
          taxonomy_level: iloTaxonomyLevel,
          verb: iloVerb,
        } = extractFromObjective(ilo);

        const { performance_target, passing_score } =
          performaceTarget(perfTarget);

        // generate new ilo
        const newILO = {
          statement: ilo,
          assessment_tool: assessTool,
          performance_target,
          passing_score,

          cognitive_level: iloCognitiveLevel,
          taxonomy_level: iloTaxonomyLevel,
          verb: iloVerb,
        } as ILO;

        currentCO!.ilo.push(newILO);
      });

      if (tableErrors.length) {
        return {
          success: false,
          message: "Found validation errors prior to conversion.",
          error: { tableErrors },
        } as ParserResult;
      }

      return {
        success: true,
        message: "Successfully converted COAEP datatable to JSON",
        data: {
          COAEP,
        },
      } as ParserResult;
    } catch (error) {
      return {
        success: false,
        message: "Error converting COAEP datatable to JSON",
        error: error,
      } as ParserResult;
    }
  }
}
