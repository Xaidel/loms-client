// import Papa from "papaparse";

// import { PO, PerfIndicator, POAEP } from "../../types/poaep";
// import DataTableException from "../types/DataTableException";
// import ParserResult from "../types/ParserResult";
// import { DataTable, DataTableInfo } from "./DataTable";
// import getPoaepHeader from "../../helper/header-getter/getPoaepHeader";

// type CellType = null | string | (string | number | null)[];
// export class PoaepDT extends DataTable<POAEP, CellType> {
//   /**
//    * Initializes the DataTable for POAEP
//    * Also sets up custom validators for the DataTable
//    */
//   constructor() {
//     super("PoaepDT");
//   }

//   async fromCSVString(
//     csvString: string,
//   ): Promise<ParserResult<DataTableInfo<CellType>>> {
//     try {
//       const info = {
//         name: this.name,
//         table: [],
//         headers: [],
//         types: [],
//       } as DataTableInfo<CellType>;

//       const rows: string[][] = Papa.parse<string[]>(csvString, {
//         skipEmptyLines: false,
//       }).data as string[][];

//       info.headers = [
//         "Program Outcome",
//         "Taxonomy Level",
//         "Performance Indicator",
//         "Formative Course",
//         "Summative Course",
//         "Assessment Tool",
//         "Performance Target",
//       ];

//       const { headerIdx, poIdx, tlIdx, piIdx, fcIdx, scIdx, atIdx, ptIdx } =
//         getPoaepHeader(rows);

//       if (headerIdx === -1)
//         throw new Error(
//           "Could not auto-detect header row. Please check the CSV.",
//         );

//       // Store values for merged rows
//       let lastSC = "";
//       let lastAT = "";
//       let lastPT = "";

//       // loop through rows
//       for (let rowIdx = headerIdx + 1; rowIdx < rows.length; rowIdx++) {
//         const row = rows[rowIdx];
//         if (!row) break;

//         if (rowIdx <= headerIdx) continue;

//         const po = row[poIdx]?.trim() || "";

//         // If new PO, flush stored values
//         if (po) {
//           lastSC = "";
//           lastAT = "";
//           lastPT = "";
//         }

//         const tl = row[tlIdx]?.trim() || "";
//         const pi = row[piIdx]?.trim() || "";
//         const fc = row[fcIdx]?.trim() || "";
//         const sc = row[scIdx]?.trim() || lastSC;
//         const at = row[atIdx]?.trim() || lastAT;
//         const pt = row[ptIdx]?.trim() || lastPT;

//         // If no FC, break
//         if (!fc) break;

//         // Split FCs
//         const fcList = fc.split(",").map((fc) => fc.trim());

//         // Push row to table
//         info.table.push([po, tl, pi, fcList, sc, at, pt]);

//         // track last values for mergeable fields
//         lastSC = sc;
//         lastAT = at;
//         lastPT = pt;
//       }

//       if (info.table.length === 0)
//         throw new Error("No data parsed. Please check the CSV.");

//       return {
//         success: true,
//         message: "Successfully converted POAEP datatable.",
//         data: info,
//       } as ParserResult;
//     } catch (error) {
//       return {
//         success: false,
//         message: "Error parsing POAEP table",
//         error: error,
//       } as ParserResult;
//     }
//   }

//   async toJson(): Promise<
//     ParserResult<{
//       jsonObj: POAEP | null;
//       validMsgs: string[];
//       tableErrors: DataTableException[];
//     }>
//   > {
//     throw new Error("Method not implemented.");
//   }

//   async validateFields(
//     validMsgs: string[],
//     tableErrors: DataTableException[],
//   ): Promise<void> {
//     throw new Error("Method not implemented.");
//     // const localErrors: DataTableException[] = []

//     // // track last values for mergeable fields
//     // let lastSC = "";
//     // let lastAT = "";
//     // let lastPT = "";
//   }
// }
