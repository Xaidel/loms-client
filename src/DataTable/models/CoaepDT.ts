import Papa from "papaparse";
import { CO, COAEP, ILO } from "../../types/coaep";
import { DataTable } from "./DataTable";
import { ParserResult } from "../types/ParserResult";
import getCoaepHeader from "../../helper/header-getter/getCoaepHeader";
import DataTableException from "../types/DataTableException";
import extractFromObjective from "../../helper/extractFromObjective.helper";
import { performaceTarget } from "../../helper/performaceTarget.helper";
import LastILOTaxo from "./validators/coaep/LastILOtaxo";
import { MinCOtaxo } from "./validators/coaep/MinCOtaxo";
import ILOTaxoOrder from "./validators/coaep/ILOTaxoOrder";
import { CoaepDT_CO, CoaepDT_ILO, CoaepRow } from "../types/CoaepDTRow";
import { MinILOPerfTarget } from "./validators/coaep/MinILOPerfTarget";
import { DEFAULT_CO_COG_LEVEL } from "../registry/registry";
import { ILOCount } from "./validators/coaep/ILOCount";

export const coaepHeaders = [
  "No.",
  "Course Outcome Statement",
  "Intended Learning Outcome",
  "Assessment Tool",
  "Performance Target",
];

export class CoaepDT extends DataTable<COAEP, CoaepRow> {
  /**
   * Initializes the DataTable for COAEP.
   * Also sets up custom validators for the DataTable.
   */
  constructor() {
    super("CoaepDT", coaepHeaders);

    // * State
    this.state = {
      faculty: null as string | null,
      course: null as string | null,
      sy: null as string | null,
      semester: null as number | null,
    };

    // * Custom validators

    // CO's taxo should be Applying or higher
    this.useValidator(new MinCOtaxo());

    // Last ILO 's taxo should match the CO's
    this.useValidator(new LastILOTaxo());

    // The ILO's within a CO should be in order
    this.useValidator(new ILOTaxoOrder());

    // The PerformanceTarget and PassingScore must not go below 50
    this.useValidator(new MinILOPerfTarget());

    // Enforce ILO constraints (between 1 and 3 for each CO)
    this.useValidator(new ILOCount());
  }

  async validateFields(
    validMsgs: string[],
    tableErrors: DataTableException[],
  ): Promise<void> {
    await this.assertInitialized().catch((error) => {
      tableErrors.push(error);
      return;
    });

    const localErrors: DataTableException[] = [];

    // track last values for mergeable fields
    let lastNum: string | null = null;
    let lastCoArr:
      | [string | null, string | null, string | null, string | null]
      | null = null;

    for (let i = 0; i < this.table.length; i++) {
      const missingIdxs: number[] = [];
      const row = this.table[i]!;

      const num: string | null = row[0] || lastNum;
      const coArr:
        | [string | null, string | null, string | null, string | null]
        | null = row[1] || lastCoArr;
      const iloArr = row[2];
      const tool = row[3];
      const target = row[4] as (number | null)[];

      if (!num) missingIdxs.push(0);
      if (!coArr) missingIdxs.push(1);
      if (!iloArr) missingIdxs.push(2);
      if (!tool) missingIdxs.push(3);
      if (!target) missingIdxs.push(4);

      if (lastCoArr !== coArr)
        this.validateObjectiveGrammar(coArr, i, 1, tableErrors);

      lastNum = num;
      lastCoArr = coArr;

      for (const j of missingIdxs) {
        localErrors.push({
          error: `Missing field: ${this.headers[j]}`,
          row: i,
          column: j,
        });
      }

      if (iloArr) this.validateObjectiveGrammar(iloArr, i, 2, tableErrors);
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
          this.state.faculty = row[facName + 1]?.trim() || this.state.faculty;
        }
        if (schoolYear !== -1) {
          this.state.sy = row[schoolYear + 1]?.trim() || this.state.sy;
        }
        if (courseIdx !== -1) {
          const courseStr = row[courseIdx + 1]?.trim().split(" ")[0] || "";
          this.state.course = courseStr || this.state.course;
        }
        if (semesterIdx !== -1) {
          const semStr = row[semesterIdx + 1]?.trim() || "";
          const semNum = semStr.match(/\d+/)?.[0];
          this.state.semester = semNum
            ? parseInt(semNum, 10)
            : this.state.semester;
        }
      });

      for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
        const row = rows[rowIndex];
        if (!row) break;

        if (rowIndex <= headerRowIndex) continue;

        // break if ilo does not exist
        if (!row[iloIdx]) break;

        let coNum = row[coIdx - 1]?.trim() || "";
        let coState = row[coIdx]?.trim() || "";
        let iloState = row[iloIdx]?.trim() || "";

        // If coIdx contains a number, use format 2
        if (/^\d+$/.test(row[coIdx]?.trim() || "")) {
          coNum = row[coIdx]?.trim() || "";
          coState = row[coIdx + 1]?.trim() || "";
        }

        // extract CO array info if co exists
        let coArr = null;
        if (coState) {
          const { cognitive_level, taxonomy_level, verb, rest } =
            extractFromObjective(coState);
          coArr = [
            cognitive_level ?? DEFAULT_CO_COG_LEVEL,
            taxonomy_level,
            verb,
            rest,
          ];
        }

        // extract ILO array info if ilo exists
        let iloArr;
        {
          const { cognitive_level, taxonomy_level, verb, rest } =
            extractFromObjective(iloState);
          iloArr = [cognitive_level, taxonomy_level, verb, rest];
        }

        const perfTargetCell =
          row[perfTargetIdx]?.replace(/\s+/g, " ").trim() || "";
        const { performance_target, passing_score } =
          performaceTarget(perfTargetCell);

        table.push([
          coNum,
          coArr as CoaepDT_CO,
          iloArr as CoaepDT_ILO,
          row[assessToolIdx]?.replace(/^ILO\d+[:.]?\s*/, "").trim() || "",
          [performance_target, passing_score],
        ]);
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
        faculty: this.state.faculty,
        course: this.state.course,
        sy: this.state.sy,
        semester: this.state.semester,
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
        const coArr = row[1]!;
        const iloArr = row[2];
        const assessTool = (row[3] || lastAT) as string;
        const perfTarget = (row[4] || lastPT) as (number | null)[];

        // if empty ilo, push error
        if (!iloArr)
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
        if (coArr) {
          const [cognitive_level, taxonomy_level, verb, rest] = coArr;

          const newCO = {
            statement: rest,
            ilo: [],
            taxonomy_level,
            cognitive_level,
            verb,
          } as CO;

          currentCO = newCO;
          COAEP.co.push(newCO);
        }

        const [iloCognitiveLevel, iloTaxonomyLevel, iloVerb, iloRest] = iloArr;

        const [performance_target, passing_score] = perfTarget;

        // generate new ilo
        const newILO = {
          statement: iloRest,
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
          success: true,
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
   * @param {[null | string, null | string, null | string, null | string] | null} objectiveArr - Array containing the parsed objective statement to validate.
   * @param {number} row - The row of the statement in the table.
   * @param {number} column - The column of the statement in the table.
   * @param {DataTableException[]} tableErrors - The array of error messages to append to.
   */
  validateObjectiveGrammar(
    objectiveArr:
      | [string | null, string | null, string | null, string | null]
      | null,
    row: number,
    column: number,
    tableErrors: DataTableException[],
  ): void {
    if (!objectiveArr) {
      tableErrors.push({
        error: "Cannot find objective statement.",
        row,
        column,
        from: `${this.name.toUpperCase()}_OBJ_GRAMMAR`,
      });
      return;
    }

    const [cognitive_level, taxonomy_level, verb, rest] = objectiveArr!;

    const missingFields = [];
    if (!cognitive_level) missingFields.push("Cognitive Level");
    if (!taxonomy_level) missingFields.push("Taxonomy Level");
    if (!verb) missingFields.push("Verb");

    if (!missingFields.length) return;

    tableErrors.push({
      error: `Cannot find fields: ${missingFields.join(", ")}.`,
      row,
      column,
      from: `${this.name.toUpperCase()}_OBJ_GRAMMAR`,
    } as DataTableException);
  }

  searchRow(rowData: CoaepRow, val: any): { column: number }[] {
    const cols: { column: number }[] = [];

    // Extract individual fields
    const [no, co, ilo, assessTool, perfTarget] = rowData!;

    // Number
    if (no === val) cols.push({ column: 0 });

    // CO
    if (
      co &&
      (co[0] === val || co[1] === val || co[2] === val || co[3] === val)
    )
      cols.push({ column: 1 });

    // ILO
    if (
      ilo &&
      (ilo[0] === val || ilo[1] === val || ilo[2] === val || ilo[3] === val)
    )
      cols.push({ column: 2 });

    // Assessment Tool
    if (assessTool === val) cols.push({ column: 3 });

    // Performance Target
    if (perfTarget && (perfTarget[0] === val || perfTarget[1] === val))
      cols.push({ column: 4 });

    return cols;
  }
}
