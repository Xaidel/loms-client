import Papa from "papaparse";
import { CO, COAEP, ILO } from "../../types/coaep";
import { DataTable, DataTableInfo } from "./DataTable";
import { ParserResult } from "../types/ParserResult";
import getCoaepHeader from "../../helper/header-getter/getCoaepHeader";
import DataTableException from "../types/DataTableException";
import extractFromObjective from "../../helper/extractFromObjective.helper";
import { performaceTarget } from "../../helper/performaceTarget.helper";
import LastILOTaxo from "./validators/coaep/LastILOtaxo";
import { MinCOtaxo } from "./validators/coaep/MinCOtaxo";
import ILOTaxoOrder from "./validators/coaep/ILOTaxoOrder";
import { MinPerfTarget } from "./validators/coaep/MinPerfTarget";

export type CoaepRow = [
  string | null, // CO No
  string | null, // CO Statement
  string | null, // ILO Statement
  string | null, // AT
  [number | null, number | null], // PerfTarget and PassingScore
];

export class CoaepDT extends DataTable<COAEP, CoaepRow> {
  faculty: string | null = null;
  course: string | null = null;
  sy: string | null = null;
  semester: number | null = null;

  /**
   * Initializes the DataTable for COAEP.
   * Also sets up custom validators for the DataTable.
   */
  constructor() {
    super("CoaepDT", [
      "No.",
      "Course Outcome Statement",
      "Intended Learning Outcome",
      "Assessment Tool",
      "Performance Target",
    ]);

    // * Custom validators

    // CO's taxo should be Applying or higher
    this.useValidator(new MinCOtaxo());

    // Last ILO 's taxo should match the CO's
    this.useValidator(new LastILOTaxo());

    // The ILO's within a CO should be in order
    this.useValidator(new ILOTaxoOrder());

    // The PerformanceTarget and PassingScore must not go below 50
    this.useValidator(new MinPerfTarget());
  }

  async validateFields(
    validMsgs: string[],
    tableErrors: DataTableException[],
  ): Promise<void> {
    const localErrors: DataTableException[] = [];

    // track last values for mergeable fields
    let lastNum: string | null = null;
    let lastCOStmt: string | null = null;

    for (let i = 0; i < this.table.length; i++) {
      const missingIdxs: number[] = [];
      const row = this.table[i]!;

      const num: string | null = row[0] || lastNum;
      const coStmt: string | null = (row[1]! as string | null) || lastCOStmt;
      const iloStmt = row[2];
      const tool = row[3];
      const target = row[4] as (number | null)[];

      if (!num) missingIdxs.push(0);
      if (!coStmt) missingIdxs.push(1);
      if (!iloStmt) missingIdxs.push(2);
      if (!tool) missingIdxs.push(3);
      if (!target) missingIdxs.push(4);

      if (lastCOStmt !== coStmt)
        this.validateObjectiveGrammar(coStmt!, i, 1, tableErrors);

      lastNum = num;
      lastCOStmt = coStmt;

      for (const j of missingIdxs) {
        localErrors.push({
          error: `Missing field: ${this.headers[j]}`,
          row: i,
          column: j,
        });
      }

      if (iloStmt)
        this.validateObjectiveGrammar(iloStmt as string, i, 2, tableErrors);
    }

    if (localErrors.length > 0) tableErrors.push(...localErrors);
    else validMsgs.push(`${this.name} successfully validated all fields.`);
  }

  async fromCSVString(csvString: string): Promise<ParserResult<CoaepRow[]>> {
    try {
      const table: CoaepRow[] = [];

      const rows: string[][] = Papa.parse<string[]>(csvString, {
        skipEmptyLines: false,
      }).data as string[][];

      const { headerRowIndex, coIdx, iloIdx, assessToolIdx, perfTargetIdx } =
        getCoaepHeader(rows);

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

        const perfTargetCell =
          row[perfTargetIdx]?.replace(/\s+/g, " ").trim() || "";
        const { performance_target, passing_score } =
          performaceTarget(perfTargetCell);

        if (row[iloIdx])
          table.push([
            coNum,
            coState,
            row[iloIdx]?.trim() || "",
            row[assessToolIdx]?.replace(/^ILO\d+[:.]?\s*/, "").trim() || "",
            [performance_target, passing_score],
          ]);
        else break;
      }

      return {
        success: true,
        message: "Successfully converted COAEP datatable.",
        data: table,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error parsing COAEP table",
        error: error,
      } as ParserResult;
    }
  }

  async toJson(): Promise<
    ParserResult<{
      jsonObj: COAEP;
      validMsgs: string[];
      tableErrors: DataTableException[];
    }>
  > {
    const validMsgs: string[] = [];
    const tableErrors: DataTableException[] = [];
    const dteFrom = "COAEPDT_TO_JSON";
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
      let lastPT: (number | null)[] = [null, null];

      this.table.forEach((row, i) => {
        // if empty co statement at first row, push error
        if (i === 0 && !row[1])
          tableErrors.push({
            error: "Cannot have empty CO Statement in first row.",
            row: 0,
            column: 1,
            from: dteFrom,
          });

        // if new CO, flush stored values
        if (row[1]) {
          lastAT = "";
          lastPT = [null, null];
        }

        // fetch row data
        const co = row[1]! as string;
        const ilo = row[2]! as string;
        const assessTool = (row[3] || lastAT) as string;
        const perfTarget = (row[4] || lastPT) as (number | null)[];

        // if empty ilo, push error
        if (!ilo)
          tableErrors.push({
            error: "Cannot have empty ILO.",
            row: 1,
            column: 2,
            from: dteFrom,
          });

        // if empty assessTool, push error
        if (!assessTool)
          tableErrors.push({
            error: "Cannot have empty Assessment Tool.",
            row: i,
            column: 3,
            from: dteFrom,
          });

        // if empty perfTarget, push error
        if (!perfTarget)
          tableErrors.push({
            error: "Cannot have empty Performance Target.",
            row: i,
            column: 4,
            from: dteFrom,
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

        const [performance_target, passing_score] = perfTarget;

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
        tableErrors.push({
          error: "Converted COAEP datatable to JSON, but with errors.",
          from: dteFrom,
        } as DataTableException);

        return {
          success: false,
          message: "Converted COAEP datatable to JSON, but with errors.",
          data: {
            jsonObj: COAEP,
            validMsgs,
            tableErrors,
          },
        } as ParserResult;
      }

      validMsgs.push("Successfully converted COAEP datatable to JSON.");

      return {
        success: true,
        message: "Successfully converted COAEP datatable to JSON",
        data: {
          jsonObj: COAEP,
          validMsgs,
          tableErrors,
        },
      } as ParserResult;
    } catch (error) {
      tableErrors.push({
        error: "Error converting COAEP datatable to JSON",
        from: dteFrom,
      } as DataTableException);

      return {
        success: false,
        message: "Error converting COAEP datatable to JSON",
        error: error,
        data: {
          jsonObj: null,
          tableErrors,
        },
      } as ParserResult;
    }
  }

  /**
   * Local helper function that to validate grammar of a CO/ILO statement.
   * Checks if the statement follows grammar to fetch the fields: cognitive level, taxonomy level, verb
   *
   * @param {string} stmt - The objective statement to validate.
   * @param {number} row - The row of the statement in the table.
   * @param {number} column - The column of the statement in the table.
   * @param {DataTableException[]} tableErrors - The array of error messages to append to.
   */
  validateObjectiveGrammar(
    stmt: string,
    row: number,
    column: number,
    tableErrors: DataTableException[],
  ): void {
    const { cognitive_level, taxonomy_level, verb } =
      extractFromObjective(stmt);

    const missingFields = [];
    if (!cognitive_level) missingFields.push("cognitive_level");
    if (!taxonomy_level) missingFields.push("taxonomy_level");
    if (!verb) missingFields.push("verb");

    if (!missingFields.length) return;

    tableErrors.push({
      error: `Cannot find fields: ${missingFields.join(", ")}.`,
      row,
      column,
      from: `${this.name.toUpperCase()}_OBJ_GRAMMAR`,
    } as DataTableException);
  }
}
