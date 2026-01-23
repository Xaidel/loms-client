import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { COAEPDataTable } from "../../DataTable/TableTypes/COAEPTable";

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

const coaepDT = new COAEPDataTable();
await coaepDT.initializeTable(validCoaepCSV);
// console.log(coaepDT.getTable().data);

const result = await coaepDT.toJson();
// console.log(result);
console.log(result.data?.COAEP);
// console.log(result.data?.COAEP?.co[0]);
// console.log(result.error.tableErrors);

console.log("=== All Tests Complete ===");
