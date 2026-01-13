import Papa from "papaparse";
import { PO, PerfIndicator } from "../types/poaep";
import { performaceTarget } from "../helper/performaceTarget.helper";
import getPoaepHeader from "../helper/header-getter/getPoaepHeader";
import parseFormativeCourses from "../helper/parseFormativeCourses.helper";

const parsePOAEP = (csvString: string) => {
  try {
    const rows: string[][] = Papa.parse<string[]>(csvString, {
      skipEmptyLines: false,
    }).data as string[][];

    const { headerIdx, poIdx, tlIdx, piIdx, fcIdx, scIdx, atIdx, ptIdx } =
      getPoaepHeader(rows);

    const POs: PO[] = [];
    let currentPO: PO = {
      po_desc: "",
      seq_no: 0,
      PerfIndicators: [],
    };

    // Allow repetition for merged rows
    let lastSC = "";
    let lastAT = "";
    let lastPT = "";

    // loop through rows
    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];

      // end if row is empty
      if (!row) break;

      // if PO has value, create a new PO at the currentPO
      const new_po_desc = row[poIdx]?.trim() || "";
      if (new_po_desc !== "") {
        currentPO = {
          po_desc: new_po_desc,
          seq_no: currentPO.seq_no + 1,
          PerfIndicators: [],
        };
        POs.push(currentPO);

        // reset repeatable columns
        lastSC = "";
        lastAT = "";
        lastPT = "";
      }

      // error if po_desc is empty
      if (currentPO.po_desc === "") {
        throw new Error(`Invalid Program Outcome at row ${i}.`);
      }

      // * retrieve column values

      const pi = row[piIdx]?.trim() || "";
      if (pi === "") break;
      // end loop if pi column is empty

      const fc = row[fcIdx]?.trim() || "";
      if (fc === "") throw new Error(`Empty Formative Courses at row ${i}.`);

      const sc = row[scIdx]?.trim() || lastSC;
      if (sc === "") throw new Error(`Empty Summative Course at row ${i}.`);
      lastSC = sc;

      const at = row[atIdx]?.trim() || lastAT;
      if (at === "") throw new Error(`Empty Assessment Tool at row ${i}.`);
      lastAT = at;

      const pt = row[ptIdx]?.trim() || lastPT;
      if (pt === "") throw new Error(`Empty Performance Target at row ${i}.`);
      lastPT = pt;

      // * Taxonomy Level not implemented for now
      // const tl = row[tlIdx]?.trim() || "";
      // if (tl === "") throw new Error(`Empty Taxonomy Level at row ${i}.`);

      // parse FormativeCourses
      const fcArr = parseFormativeCourses(fc);
      if (fcArr.length === 0) {
        throw new Error(`Invalid Formative Courses format at row ${i}.`);
      }
      // parse PerformanceTargets
      const ptArr = performaceTarget(pt);
      if (!ptArr.performance_target || !ptArr.passing_score) {
        throw new Error(`Invalid Performance Targets format at row ${i}.`);
      }

      // create PerfIndicator
      const perfIndicator: PerfIndicator = {
        pi_desc: pi,
        FormativeCourses: fcArr.map((fc) => ({
          course_id: fc,
          cognitive_level: 0,
        })),
        SummativeCourse: { course_id: sc },
        AssessmentTool: { at_desc: at },
        PerformanceTargets: {
          target_percent: ptArr.performance_target,
          min_score: ptArr.passing_score,
        },
      };

      // add to currentPO
      currentPO.PerfIndicators.push(perfIndicator);
    }

    return {
      success: true,
      message: "Successfully parsed POAEP file.",
      data: {
        POAEP: POs,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : (error as string),
      message: "Please ensure the file follows the POAEP template.",
    };
  }
};

export default parsePOAEP;
