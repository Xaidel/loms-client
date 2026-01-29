import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { CoaepDT } from "../../DataTable/models/CoaepDT";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sampleFilePath = path.join(__dirname, "test-file.local.xlsx");

let validCoaepCSV = "";

if (fs.existsSync(sampleFilePath)) {
  try {
    const fileBuffer = fs.readFileSync(sampleFilePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    if (sheetName) {
      const workSheet = workbook.Sheets[sheetName];
      if (workSheet) {
        validCoaepCSV = XLSX.utils.sheet_to_csv(workSheet);
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
  console.error("Sample COAEP Excel file not found at:", sampleFilePath);
}

console.log("=== Test 1: Valid COAEP CSV ===");

const coaepDT = new CoaepDT();

// initialize with CSV
await coaepDT.initializeTable(validCoaepCSV);

// Fetch table Data
console.log("== Fetch Table Data ===");
const result1 = coaepDT.getTable();
console.dir(result1, { depth: null });

// Update table data
console.log("== Update Table Data ===");
let table = result1.data!.table;
table[0]![3] = "New Assessment tool";
await coaepDT.setTable(table);
let result2 = await coaepDT.toJson();
console.dir(result2!.data!.jsonObj!.co[0]!.ilo[0], { depth: null });

// validation
console.log("== Validation ===");
const result3 = await coaepDT.validate();
console.dir(result3, { depth: null });

// Convert to JSON
console.log("== Convert to JSON ===");
const result4 = await coaepDT.toJson();
console.dir(result4, { depth: null });

console.log("=== All Tests Complete ===");
