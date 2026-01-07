import Papa from "papaparse";
import {
  PO,
  PerfIndicator,
  PIFormative,
  PISummative,
  PIPerfTarget,
} from "../types/poaep";
import { performaceTarget } from "../helper/performaceTarget.helper";
import getPoaepHeader from "../helper/header-getter/getPoaepHeader";

export function parsePOAEP(csvString: string) {
  try {
    const rows: string[][] = Papa.parse<string[]>(csvString, {
      skipEmptyLines: false,
    }).data as string[][];

    const { headerRowIndex, poIdx, tlIdx, piIdx, fcIdx, scIdx, atIdx, ptIdx } =
      getPoaepHeader(rows);

    if (headerRowIndex === -1) throw new Error("Header row not found.");

    const fcWidth = scIdx - fcIdx;

    return JSON.stringify({
      indexes: {
        headerRowIndex,
        poIdx,
        tlIdx,
        piIdx,
        fcIdx,
        scIdx,
        atIdx,
        ptIdx,
      },
      fcWidth,
      data: rows,
    });
  } catch (error) {
    return {
      error: error,
      message: "Please ensure the file follows the POAEP template.",
    };
  }
}
