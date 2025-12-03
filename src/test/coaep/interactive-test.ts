import { parseCOAEP } from "../../parser/coaep";
import * as fs from "fs";
import * as path from "path";

/**
 * Interactive test script for COAEP parser
 *
 * Usage:
 *   npx ts-node src/test/interactive-test.ts
 *   npx ts-node src/test/interactive-test.ts path/to/file.csv
 */

function loadAndParseCOAEP(filePath: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Loading file: ${filePath}`);
  console.log("=".repeat(60));

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: File not found: ${filePath}`);
      return;
    }

    // Read file content
    const csvContent = fs.readFileSync(filePath, "utf-8");
    console.log(`✓ File loaded successfully (${csvContent.length} bytes)\n`);

    // Parse the CSV
    console.log("Parsing COAEP data...\n");
    const result = parseCOAEP(csvContent);

    // Check for errors
    if ("error" in result) {
      console.error("❌ Parsing Error:");
      console.error(`   ${result.error}`);
      console.error(`   ${result.message}`);
      return;
    }

    // Display results
    console.log("✅ Parsing Successful!\n");
    console.log("=".repeat(60));
    console.log("PARSED DATA SUMMARY");
    console.log("=".repeat(60));

    const { COAEP } = result;

    console.log("\n📋 COURSE INFORMATION");
    console.log("-".repeat(60));
    console.log(`  Faculty: ${COAEP.faculty || "N/A"}`);
    console.log(`  Course: ${COAEP.course || "N/A"}`);
    console.log(`  School Year: ${COAEP.sy || "N/A"}`);
    console.log(`  Semester: ${COAEP.semester || "N/A"}`);

    console.log("\n📊 COURSE OUTCOMES");
    console.log("-".repeat(60));
    console.log(`  Total COs: ${COAEP.co.length}\n`);

    COAEP.co.forEach((co, coIndex) => {
      console.log(`  CO ${coIndex + 1}:`);
      console.log(`    Statement: ${co.statement}`);
      console.log(`    Verb: ${co.verb || "N/A"}`);
      console.log(`    ILOs: ${co.ilo.length}\n`);

      co.ilo.forEach((ilo, iloIndex) => {
        console.log(`    📌 ILO ${iloIndex + 1}:`);
        console.log(`       Statement: ${ilo.statement}`);
        console.log(`       Verb: ${ilo.verb || "N/A"}`);
        console.log(`       Assessment Tool: ${ilo.assessment_tool}`);
        console.log(
          `       Performance Target: ${
            ilo.performance_target !== null
              ? ilo.performance_target + "%"
              : "N/A"
          }`
        );
        console.log(
          `       Passing Score: ${
            ilo.passing_score !== null ? ilo.passing_score + "%" : "N/A"
          }`
        );
        console.log();
      });
    });

    console.log("=".repeat(60));
    console.log("\n📄 FULL JSON OUTPUT");
    console.log("=".repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("❌ Unexpected Error:");
    console.error(error);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  // No arguments - use default sample file
  const defaultFile = path.join(__dirname, "sample-coaep.csv");
  loadAndParseCOAEP(defaultFile);
} else {
  // Use provided file path
  const filePath = path.resolve(args[0]!);
  loadAndParseCOAEP(filePath);
}

console.log("\n💡 Tip: You can test other CSV files by running:");
console.log(
  "   npx tsx src/test/coaep/interactive-test.ts path/to/your/file.csv\n"
);
