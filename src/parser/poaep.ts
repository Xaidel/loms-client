import Papa from "papaparse";
import { PO, PerfIndicator } from "../types/poaep";
import { performaceTarget } from "../helper/performaceTarget.helper";
import getPoaepHeader from "../helper/header-getter/getPoaepHeader";
import parseFormativeCourses from "../helper/parseFormativeCourses.helper";

type Indices = {
  headerRowIndex: number;
  poIdx: number;
  tlIdx: number;
  piIdx: number;
  fcIdx: number;
  scIdx: number;
  atIdx: number;
  ptIdx: number;
};

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
      lastSC = sc;
      if (sc === "") throw new Error(`Empty Summative Course at row ${i}.`);

      const at = row[atIdx]?.trim() || lastAT;
      lastAT = at;
      if (at === "") throw new Error(`Empty Assessment Tool at row ${i}.`);

      const pt = row[ptIdx]?.trim() || lastPT;
      lastPT = pt;
      if (pt === "") throw new Error(`Empty Performance Target at row ${i}.`);

      // Taxonomy Level not implemented for now
      // const tl = row[tlIdx]?.trim() || "";

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
      data: POs,
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

let testOut: PO[] = [
  {
    po_desc:
      "Identify a way how to solve a problem using computing and domain knowledge based on its specifications and requirements",
    seq_no: 1,

    PerfIndicators: [
      {
        pi_desc:
          "Identify a way how to solve a problem using computing and domain knowledge based on its specifications and requirements",

        FormativeCourses: [
          { course_id: "BCS111k", cognitive_level: 0 },
          { course_id: "BCS112k", cognitive_level: 0 },
          { course_id: "BCS122k", cognitive_level: 0 },
          { course_id: "BCS212k", cognitive_level: 0 },
          { course_id: "BCS224k", cognitive_level: 0 },
          { course_id: "BCS222k", cognitive_level: 0 },
        ],
        SummativeCourse: { course_id: "BCS401k" },
        AssessmentTool: { at_desc: "Project Proposal" },
        PerformanceTargets: { target_percent: 80, min_score: 75 },
      },
      {
        pi_desc:
          "Create an appropriate software designs to describe a computing solution for the specified problems and requirements",

        FormativeCourses: [
          { course_id: "BIT112k", cognitive_level: 0 },
          { course_id: "BIT122k", cognitive_level: 0 },
          { course_id: "BIT212k", cognitive_level: 0 },
          { course_id: "BIT224k", cognitive_level: 0 },
          { course_id: "BIT223k", cognitive_level: 0 },
          { course_id: "BIT222k", cognitive_level: 0 },
        ],
        SummativeCourse: { course_id: "BCS411k" },
        AssessmentTool: { at_desc: "SP Findings" },
        PerformanceTargets: { target_percent: 80, min_score: 75 },
      },
    ],
  },
];
