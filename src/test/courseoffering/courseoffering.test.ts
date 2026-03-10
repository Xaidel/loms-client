/*
  npx tsx src\test\courseoffering\courseoffering.test.ts
*/
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { parseCourseOffering } from "../../parser/courseOffering";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sampleFilePath = path.join(__dirname, "2526.local.xls");

let validCourseOfferingCSV = "";

if (fs.existsSync(sampleFilePath)) {
  try {
    const fileBuffer = fs.readFileSync(sampleFilePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    if (sheetName) {
      const workSheet = workbook.Sheets[sheetName];
      if (workSheet) {
        validCourseOfferingCSV = XLSX.utils.sheet_to_csv(workSheet);
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
  console.error(
    "Sample Course Offering Excel file not found at:",
    sampleFilePath,
  );
}

console.log("=== Test: Course Offering Parser ===");

// Parse the CSV data using the Course Offering parser
const result = parseCourseOffering(validCourseOfferingCSV);
// Display the result with full depth using console.dir
console.dir({ result }, { depth: null });

console.log("=== Test Complete ===");
