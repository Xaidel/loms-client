import parsePOAEP from "../../parser/poaep";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

/**
 * Test suite for POAEP parser
 *
 * This file contains various test cases for the parsePOAEP function
 * Run with: npx tsx src/test/poaep/poaep.test.ts
 */

// Load the actual sample POAEP Excel file and convert to CSV
const sampleFilePath = path.join(__dirname, "test_file.local.xlsx");
let validPoaepCSV = "";

if (fs.existsSync(sampleFilePath)) {
  try {
    const fileBuffer = fs.readFileSync(sampleFilePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    if (sheetName) {
      const workSheet = workbook.Sheets[sheetName];
      if (workSheet) {
        validPoaepCSV = XLSX.utils.sheet_to_csv(workSheet);
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
  console.error("Sample POAEP Excel file not found at:", sampleFilePath);
}

// Sample CSV with missing headers
const missingHeadersCSV = `
Some random data
More random data
`;

// Sample CSV with incomplete data
const incompleteDataCSV = `
Program Outcome,Performance Indicator,Formative Course,Summative Course,Assessment Tool,Performance Target
PO1 - Apply knowledge,,,,,
`;

// Test 1: Parse valid POAEP data from Excel
console.log("=== Test 1: Valid POAEP CSV (from Excel) ===");
const result1 = parsePOAEP(validPoaepCSV);
console.log(JSON.stringify(result1, null, 2));
console.log("\n");

// Test 2: Missing headers
console.log("=== Test 2: Missing Headers ===");
const result2 = parsePOAEP(missingHeadersCSV);
console.log(JSON.stringify(result2, null, 2));
console.log("\n");

// Test 3: Incomplete data
console.log("=== Test 3: Incomplete Data ===");
const result3 = parsePOAEP(incompleteDataCSV);
console.log(JSON.stringify(result3, null, 2));
console.log("\n");

// Test 4: Empty string
console.log("=== Test 4: Empty String ===");
const result4 = parsePOAEP("");
console.log(JSON.stringify(result4, null, 2));
console.log("\n");

// Test 5: Verify structure
console.log("=== Test 5: Structure Verification ===");
const result5 = parsePOAEP(validPoaepCSV);
if (typeof result5 === "string") {
  try {
    const parsed = JSON.parse(result5);
    console.log("✓ Parsed successfully");
    console.log("✓ Header Row Index:", parsed.indexes?.headerRowIndex);
    console.log("✓ FC Width:", parsed.fcWidth);
    console.log("✓ Data rows:", parsed.data?.length);

    if (parsed.data && parsed.data.length > 0) {
      console.log(
        "✓ Sample data row:",
        parsed.data[parsed.indexes?.headerRowIndex + 1]
      );
    }
  } catch (e) {
    console.log("✗ Failed to parse result:", e);
  }
} else if (result5 && typeof result5 === "object" && "error" in result5) {
  console.log("✗ Error occurred:", result5.error);
} else {
  console.log("✗ Unexpected result format:", result5);
}
console.log("\n");

console.log("=== All Tests Complete ===");
