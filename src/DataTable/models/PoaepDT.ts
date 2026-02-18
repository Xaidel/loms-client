import Papa from "papaparse";

import { PerfIndicator, PO, POAEP } from "../../types/poaep";
import DataTableException from "../types/DataTableException";
import ParserResult from "../types/ParserResult";
import { DataTable } from "./DataTable";
import getPoaepHeader from "../../helper/header-getter/getPoaepHeader";
import {
  PoaepDT_AT,
  PoaepDT_FC,
  PoaepDT_PI,
  PoaepDT_PO,
  PoaepDT_PT,
  PoaepDT_SC,
  PoaepDT_Taxo,
  PoaepRow,
} from "../types/PoaepDTRow";
import Taxonomy from "../../types/Taxonomy";
import { performaceTarget } from "../../helper/performaceTarget.helper";
import { MinPItaxo } from "./validators/poaep/MinPItaxo";
import { MinPIPerfTarget } from "./validators/poaep/MinPIPerfTarget";

export const poaepHeaders = [
  "Program Outcome",
  "Taxonomy Level",
  "Performance Indicator",
  "Formative Course",
  "Summative Course",
  "Assessment Tool",
  "Performance Target",
];

export class PoaepDT extends DataTable<POAEP, PoaepRow> {
  /**
   * Initializes the DataTable for POAEP
   * Also sets up custom validators for the DataTable
   */
  constructor() {
    super("PoaepDT", poaepHeaders);

    // * State
    this.state = {
      program: null as string | null,
    };

    // * Custom validators

    // PI's taxo should be Applying or higher
    this.useValidator(new MinPItaxo());

    // The PerformanceTarget and PassingScore must not go below 50
    this.useValidator(new MinPIPerfTarget());
  }

  async fromCSVString(csvString: string): Promise<ParserResult<PoaepRow[]>> {
    try {
      const table: PoaepRow[] = [];

      const rows: string[][] = Papa.parse<string[]>(csvString, {
        skipEmptyLines: false,
      }).data as string[][];

      // Get row with cell containing substring "program:", parse remaining words for program
      rows.forEach((row) => {
        row.forEach((cell) => {
          if (cell.includes("PROGRAM:")) {
            this.state.program = cell
              .replace("PROGRAM:", "")
              .trim()
              .toUpperCase();
          }
        });
      });

      const { headerIdx, poIdx, tlIdx, piIdx, fcIdx, scIdx, atIdx, ptIdx } =
        getPoaepHeader(rows);

      if (headerIdx === -1)
        throw new Error(
          "Could not auto-detect header row. Please check the CSV.",
        );

      // Store values for merged rows
      let lastSC = "";
      let lastAT = "";
      let lastPT = "";

      // loop through rows
      for (let rowIdx = headerIdx + 1; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        if (!row) break;

        if (rowIdx <= headerIdx) continue;

        let po = row[poIdx]?.trim() || "";

        // If new PO, flush stored values
        if (po) {
          lastSC = "";
          lastAT = "";
          lastPT = "";

          // extract the PO description
          const [poNum, poDesc] = this.extractPoDesc(po);
          if (poDesc) po = poDesc;
        }

        const tl = (row[tlIdx]?.trim().toLowerCase() as Taxonomy) || null;
        const pi = row[piIdx]?.trim() || "";
        const fc = row[fcIdx]?.trim() || "";
        const sc = row[scIdx]?.trim() || lastSC;
        const at = row[atIdx]?.trim() || lastAT;
        const pt = row[ptIdx]?.trim() || lastPT;

        const { performance_target, passing_score } = performaceTarget(pt);

        // If no FC, break
        if (!fc) break;

        // Split FCs
        const fcList = fc.split(",").map((fc) => fc.trim());

        // Push row to table
        table.push([
          po,
          tl,
          pi,
          fcList,
          sc,
          at,
          [performance_target, passing_score],
        ]);

        // track last values for mergeable fields
        lastSC = sc;
        lastAT = at;
        lastPT = pt;
      }

      if (table.length === 0)
        throw new Error("No data parsed. Please check the CSV.");

      return {
        success: true,
        message: "Successfully converted POAEP datatable.",
        data: table,
      } as ParserResult;
    } catch (error) {
      return {
        success: false,
        message: "Error parsing POAEP table",
        error: error,
      } as ParserResult;
    }
  }

  async toJson(): Promise<
    ParserResult<{
      jsonObj: POAEP;
      validMsgs: string[];
      tableErrors: DataTableException[];
    }>
  > {
    const validMsgs: string[] = [];
    const tableErrors: DataTableException[] = [];
    const dteFrom = "POAEPDT_TO_JSON";
    try {
      await this.assertInitialized();
      const POAEP: POAEP = {
        po: [],
      };

      let currentPO: PO = {
        po_desc: "",
        seq_no: 0,
        PerfIndicators: [],
      };

      // store values for mergeable fields
      let lastSC: PoaepDT_SC = null;
      let lastAT: PoaepDT_AT = null;
      let lastPT: PoaepDT_PT | null = null;

      // loop through rows
      for (let i = 0; i < this.table.length; i++) {
        const row = this.table[i]! as PoaepRow;

        const rowErrors: DataTableException[] = [];

        const new_po_desc = row[0]?.trim() || null;

        // if new PO, create a new PO at the currentPO
        if (new_po_desc && new_po_desc !== currentPO.po_desc) {
          currentPO = {
            po_desc: new_po_desc,
            seq_no: currentPO.seq_no + 1,
            PerfIndicators: [],
          };
          POAEP.po.push(currentPO);

          // flush stored values
          lastSC = null;
          lastAT = null;
          lastPT = null;
        }

        if (currentPO.po_desc === "")
          tableErrors.push({
            error: "Cannot start with empty Program Outcome.",
            row: i,
            column: 0,
            from: dteFrom,
          } as DataTableException);

        // fetch cell values
        const tl = row[1] || null;
        const pi = row[2] || null;
        const fc = row[3] || null;
        const sc = row[4] || lastSC;
        const at = row[5] || lastAT;
        const pt = row[6] || lastPT;

        if (!fc || fc.length === 0) {
          tableErrors.push({
            error: "Cannot have empty Formative Courses.",
            row: i,
            column: 3,
            from: dteFrom,
          } as DataTableException);
        }

        if (!pt) {
          tableErrors.push({
            error: "Cannot have empty Performance Target.",
            row: i,
            column: 6,
            from: dteFrom,
          } as DataTableException);
        }

        if (rowErrors.length > 0) {
          tableErrors.push(...rowErrors);
          continue;
        }

        // create PerfIndicator for the row and push to currentPO
        const perfIndicator: PerfIndicator = {
          pi_desc: pi!,
          FormativeCourses: fc!.map((course) => ({
            course_id: course!,
            cognitive_level: null,
          })),
          SummativeCourse: {
            course_id: sc!,
          },
          TaxonomyLevel: tl ? { label: tl } : null,
          AssessmentTool: { at_desc: at! },
          PerformanceTargets: {
            target_percent: pt![0]!,
            min_score: pt![1]!,
          },
        };
        currentPO.PerfIndicators.push(perfIndicator);
      }

      if (tableErrors.length > 0) {
        tableErrors.push({
          error: "Converted POAEP datatable to JSON, but with errors.",
          from: dteFrom,
        } as DataTableException);

        return {
          success: true,
          message: "Converted COAEP datatable to JSON, but with errors.",
          data: {
            jsonObj: POAEP,
            validMsgs: validMsgs,
            tableErrors: tableErrors,
          },
        } as ParserResult;
      }

      validMsgs.push("Successfully converted POAEP datatable to JSON.");
      return {
        success: true,
        message: "Successfully converted POAEP datatable.",
        data: {
          jsonObj: POAEP,
          validMsgs: validMsgs,
          tableErrors: tableErrors,
        },
      } as ParserResult;
    } catch (error) {
      return {
        success: false,
        message: "Error parsing POAEP table",
        error: error,
      } as ParserResult;
    }
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

    // store values for mergeable fields
    let lastPO: PoaepDT_PO = null;
    let lastSC: PoaepDT_SC = null;
    let lastAT: PoaepDT_AT = null;
    let lastPT: PoaepDT_PT | null = null;

    // loop through rows
    for (let i = 0; i < this.table.length; i++) {
      const missingIdxs: number[] = [];
      const row = this.table[i]! as PoaepRow;

      // if new PO, flush stored values
      if (row[0] && row[0] !== lastPO) {
        lastSC = null;
        lastAT = null;
        lastPT = null;
      }

      // extract cell values
      const po: PoaepDT_PO = row[0] || lastPO;
      const tl: PoaepDT_Taxo = row[1] || null;
      const pi: PoaepDT_PI = row[2] || null;
      const fc: PoaepDT_FC[] = row[3] || null;
      const sc: PoaepDT_SC = row[4] || lastSC;
      const at: PoaepDT_AT = row[5] || lastAT;
      const pt: PoaepDT_PT | null = row[6] || lastPT;

      // track missing values
      if (!po) missingIdxs.push(0);
      if (!tl) missingIdxs.push(1);
      if (!pi) missingIdxs.push(2);
      if (!fc) missingIdxs.push(3);
      if (!sc) missingIdxs.push(4);
      if (!at) missingIdxs.push(5);
      if (!pt) missingIdxs.push(6);

      // report missing values
      if (missingIdxs.length > 0) {
        missingIdxs.forEach((idx) => {
          localErrors.push({
            error: `Missing field: ${this.headers[idx]}.`,
            row: i,
            column: idx,
            from: `${this.name.toUpperCase()}_VALIDATE_FIELDS`,
          });
        });
      }

      // report empty FormativeCourses
      if (fc?.length === 0) {
        localErrors.push({
          error: `Cannot have empty Formative Courses.`,
          row: i,
          column: 3,
          from: `${this.name.toUpperCase()}_VALIDATE_FIELDS`,
        });
      }

      // track last values for mergeable fields
      lastPO = po;
      lastSC = sc;
      lastAT = at;
      lastPT = pt;
    }

    if (localErrors.length > 0) tableErrors.push(...localErrors);
    else validMsgs.push(`${this.name} successfully validated all fields.`);
  }

  extractPoDesc(desc: string): string[] {
    const regex = /^.*(PO\d+):(.*)$/;
    const match = regex.exec(desc.trim());
    return match ? match.slice(1) : ["", desc.trim()];
  }
}
