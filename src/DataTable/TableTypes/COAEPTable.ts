import Papa from "papaparse";
import { convertToCSVFile } from "../../parser/xls";
import { COAEP, CO } from "../../types/coaep";
import { DataTable, DataTableInfo } from "../DataTable";
import { ParserResult } from "../../types/parserResult";
import getCoaepHeader from "../../helper/header-getter/getCoaepHeader";
import DataTableException from "../DataTableException";
export class COAEPTable extends DataTable<COAEP> {
  faculty: string | null = null;
  course: string | null = null;
  sy: string | null = null;
  semester: number | null = null;

  constructor() {
    super();
    this.name = "COAEP DataTable";
  }

  async fromXML(xls: File): Promise<ParserResult<DataTableInfo>> {
    try {
      const info = {
        name: this.name,
        table: [],
        headers: [],
        types: [],
      } as DataTableInfo;

      const csv: File = await convertToCSVFile(xls);
      const csvString = await csv.text();

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

      info.types = ["number", "string", "string", "string", "string"];

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

      rows.forEach((row, rowIndex) => {
        if (rowIndex <= headerRowIndex) return;

        let coNum = row[coIdx - 1]?.trim() || "";
        let coState = row[coIdx]?.trim() || "";

        // If coIdx contains a number, use format 2
        if (/^\d+$/.test(row[coIdx]?.trim() || "")) {
          coNum = row[coIdx]?.trim() || "";
          coState = row[coIdx + 1]?.trim() || "";
        }

        if (coNum && /^\d+$/.test(coNum))
          info.table.push([
            +coNum,
            coState,
            row[iloIdx]?.trim() || "",
            row[assessToolIdx]?.replace(/^ILO\d+[:.]?\s*/, "").trim() || "",
            row[perfTargetIdx]?.replace(/\s+/g, " ").trim() || "",
          ]);
      });

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
    ParserResult<{ tableErrors: DataTableException[] }>
  > {
    try {
      this.assertInitialized();
      // assert here
      return {
        success: true,
        message: "Successfully validated COAEP datatable.",
        data: {
          tableErrors: [],
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

  async toJson(): Promise<ParserResult<COAEP>> {
    try {
      this.assertInitialized();

      const data = {
        faculty: this.faculty,
        course: this.course,
        sy: this.sy,
        semester: this.semester,
        co: [],
      } as COAEP;

      return {
        success: true,
        message: "Successfully converted COAEP datatable to JSON",
        data,
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
