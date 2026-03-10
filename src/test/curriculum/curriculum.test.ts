// npx tsx src\test\curriculum\curriculum.test.ts

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { convertToCSVFile } from "../../parser/xls";
import { parseCurriculum } from "../../parser/curriculum";
import Papa from "papaparse";
import { parseCurriculumToJson } from "../../payloads/parseCurriculumToJson";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sampleFilePath = path.join(__dirname, "OA.local.xls");

let currCSV = "";

if (fs.existsSync(sampleFilePath)) {
  try {
    const fileBuffer = fs.readFileSync(sampleFilePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    if (sheetName) {
      const workSheet = workbook.Sheets[sheetName];
      if (workSheet) {
        currCSV = XLSX.utils.sheet_to_csv(workSheet);
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
  console.error("Sample Excel file not found at:", sampleFilePath);
}

console.log("\n=== Test 1: Valid Curriculum CSV ===");

const fileContent = currCSV;
const fileName = "sample.csv";
const file = new File([fileContent], fileName, { type: "text/csv" });
console.dir(await parseCurriculumToJson(file), { depth: null });
