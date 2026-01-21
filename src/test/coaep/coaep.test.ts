import { parseCOAEP } from "../../parser/coaep";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

/**
 * Test suite for COAEP parser
 *
 * This file contains various test cases for the parseCOAEP function
 * Run with: npx tsx src/test/coaep/coaep.test.ts
 */

// Load the actual sample COAEP CSV file
// Load the actual sample POAEP Excel file and convert to CSV
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

// Sample CSV with missing headers
const missingHeadersCSV = `
Name of Faculty:,John Doe
Some random data
More random data
`;

// Sample CSV with incomplete data
const incompleteDataCSV = `
Name of Faculty:,Jane Smith,,,School Year,2024-2025
Course:,Mathematics 201,,,Semester,2

CO Number,CO Statement,,ILO Number,ILO Statement,Assessment Tool,Performance Target
1,(I) Remembering : Apply mathematical concepts,,,,
`;

// Test 1: Parse valid COAEP data
console.log("=== Test 1: Valid COAEP CSV ===");
const result1 = parseCOAEP(validCoaepCSV);
console.log(JSON.stringify(result1, null, 2));
console.log("\n");

// Test 2: Missing headers
console.log("=== Test 2: Missing Headers ===");
const result2 = parseCOAEP(missingHeadersCSV);
console.log(JSON.stringify(result2, null, 2));
console.log("\n");

// Test 3: Incomplete data
console.log("=== Test 3: Incomplete Data ===");
const result3 = parseCOAEP(incompleteDataCSV);
console.log(JSON.stringify(result3, null, 2));
console.log("\n");

// Test 4: Empty string
console.log("=== Test 4: Empty String ===");
const result4 = parseCOAEP("");
console.log(JSON.stringify(result4, null, 2));
console.log("\n");

// Test 5: Verify structure
console.log("=== Test 5: Structure Verification ===");
const result5 = parseCOAEP(validCoaepCSV);
if ("COAEP" in result5) {
  const coaep = result5.COAEP;
  console.log("✓ Faculty:", coaep.faculty);
  console.log("✓ Course:", coaep.course);
  console.log("✓ School Year:", coaep.sy);
  console.log("✓ Semester:", coaep.semester);
  console.log("✓ Number of COs:", coaep.co.length);

  coaep.co.forEach((co, idx) => {
    console.log(`\n  CO ${idx + 1}:`);
    console.log(`    Statement: ${co.statement}`);
    console.log(`    Verb: ${co.verb}`);
    console.log(`    Number of ILOs: ${co.ilo.length}`);

    co.ilo.forEach((ilo, iloIdx) => {
      console.log(`\n    ILO ${iloIdx + 1}:`);
      console.log(`      Statement: ${ilo.statement}`);
      console.log(`      Verb: ${ilo.verb}`);
      console.log(`      Assessment Tool: ${ilo.assessment_tool}`);
      console.log(`      Performance Target: ${ilo.performance_target}%`);
      console.log(`      Passing Score: ${ilo.passing_score}%`);
    });
  });
} else {
  console.log("✗ Error occurred:", result5);
}
console.log("\n");

console.log("=== All Tests Complete ===");
