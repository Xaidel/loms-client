import { parseCOAEP } from "../../parser/coaep";
import * as fs from "fs";
import * as path from "path";

/**
 * Test suite for COAEP parser
 *
 * This file contains various test cases for the parseCOAEP function
 * Run with: npx tsx src/test/coaep/coaep.test.ts
 */

// Load the actual sample COAEP CSV file
const sampleFilePath = path.join(__dirname, "sample-coaep.csv");
const validCoaepCSV = fs.existsSync(sampleFilePath)
  ? fs.readFileSync(sampleFilePath, "utf-8")
  : `
Name of Faculty:,John Doe,,,School Year,2023-2024
Course:,Computer Science 101,,,Semester,1

CO Number,CO Statement,,ILO Number,ILO Statement,Assessment Tool,Performance Target
1,Understand basic programming concepts,,ILO1,Apply problem-solving techniques,Midterm Exam,80% of students will score 75% or higher
,,,ILO2,Demonstrate critical thinking,Final Project,85% of students will score 70% or higher
2,Develop software applications,,ILO3,Create functional programs,Lab Exercise,90% of students will score 80% or higher
,,,ILO4,Test and debug code,Programming Assignment,75% of students will score 65% or higher
`;

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
1,Apply mathematical concepts,,,,
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
