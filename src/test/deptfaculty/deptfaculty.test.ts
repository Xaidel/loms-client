/*
  npx tsx src\test\deptfaculty\deptfaculty.test.ts
*/
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { parseDeptFaculty } from "../../parser/deptfaculty";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sampleFilePath = path.join(__dirname, "deptfaculty.local.xlsx");

let validDeptFacultyCSV = "";

if (fs.existsSync(sampleFilePath)) {
  try {
    const fileBuffer = fs.readFileSync(sampleFilePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    if (sheetName) {
      const workSheet = workbook.Sheets[sheetName];
      if (workSheet) {
        validDeptFacultyCSV = XLSX.utils.sheet_to_csv(workSheet);
      } else {
        console.error("Worksheet not found");
      }
    } else {
      console.error("No sheets found in workbook");
    }
  } catch (error) {
    console.error("Error reading Excel file:", error);
  }
} else {
  console.error("Sample DeptFaculty Excel file not found at:", sampleFilePath);
}

console.log("=== Test: DeptFaculty Parser ===");

// Parse the CSV data using the deptfaculty parser
const result = parseDeptFaculty(validDeptFacultyCSV);
// Display the result with full depth using console.dir
console.dir({ result }, { depth: null });

console.log("=== Test Complete ===");
