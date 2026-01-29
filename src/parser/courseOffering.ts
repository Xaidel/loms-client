import Papa from "papaparse";
import { CourseOffering } from "../types/courseOffering";

export function parseCourseOffering(csvData: string): CourseOffering[] {
  let semester = "";
  let school_year = "";

  const cleanRows: CourseOffering[] = [];

  // Parse CSV data
  const parsed = Papa.parse(csvData, {
    header: false,
    skipEmptyLines: true,
    delimiter: ",",
  });

  const rows = parsed.data as string[][];

  // Extract semester and school year from header rows
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i];
    if (row && row.length > 0) {
      const cellContent = row[0]?.toString() || "";

      // Look for semester and school year pattern like "Second Sem S/Y 2024-2025"
      const semesterMatch = cellContent.match(
        /(First|Second)\s+Sem\s+S\/Y\s+(\d{4}-\d{4})/i
      );
      if (semesterMatch) {
        // Convert semester to number: First = "1", Second = "2"
        semester = semesterMatch[1]?.toLowerCase() === "first" ? "1" : "2";

        // Convert school year format: "2024-2025" -> "2425"
        if (semesterMatch[2]) {
          const yearMatch = semesterMatch[2].match(
            /(\d{2})(\d{2})-(\d{2})(\d{2})/
          );
          if (yearMatch && yearMatch[2] && yearMatch[4]) {
            school_year = yearMatch[2] + yearMatch[4]; // Extract last 2 digits of each year
          }
        }
      }
    }
  }

  // Find the header row (should contain "CODE", "COURSE NO", etc.)
  let headerRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      row &&
      row.some((cell) => cell?.toString().toUpperCase().includes("CODE"))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error("Could not find header row in CSV data");
  }

  let prevData = {
    code: "",
    description: "",
    unit: 0,
  };

  // Process data rows (starting after header)
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];

    if (!row || row.length < 8) continue; // Skip incomplete rows

    // Extract data from each column
    const course_no = row[1]?.toString().trim() || "";
    const time = row[4]?.toString().trim() || "";
    const days = row[5]?.toString().trim() || "";
    const faculty = row[6]?.toString().trim() || "";
    const room = row[7]?.toString().trim() || "";
    const unitStr = row[3]?.toString().trim() || "";

    let code = row[0]?.toString().trim() || "";
    let course_desc = row[2]?.toString().trim() || "";

    // Skip rows without course_no
    if (!course_no) continue;

    // If empty code, description or unit, use previous values
    if (!code) code = prevData.code;
    if (!course_desc) course_desc = prevData.description;
    let unit = prevData.unit;

    // If unit exists, overide unit as number
    if (unitStr) {
      const unitMatch = unitStr.match(/(\d+)/);
      if (unitMatch && unitMatch[1]) {
        unit = parseInt(unitMatch[1], 10);
      }
    }

    // Create course offering object
    const offering: CourseOffering = {
      sem: semester,
      school_year: school_year,
      code: code,
      course_no: course_no,
      course_desc: course_desc,
      unit: unit,
      time: time,
      days: days,
      faculty: faculty,
      room: room,
    };

    // Update previous data
    prevData.code = code;
    prevData.description = course_desc;
    prevData.unit = unit;

    cleanRows.push(offering);
  }

  return cleanRows;
}
