import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

/**
 * Node.js version of Excel to CSV converter for testing
 * Note: convertToCSVFile from xls.ts is designed for browser environments
 */
function convertXLSXtoCSV(xlsxPath: string): string {
  // Read the Excel file
  const workbook = XLSX.readFile(xlsxPath);

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("No sheets found in workbook");
  }

  const workSheet = workbook.Sheets[sheetName];
  if (!workSheet) {
    throw new Error("No sheets found in worksheet");
  }

  // Convert to CSV (removes empty columns)
  const csvString = XLSX.utils.sheet_to_csv(workSheet, { strip: true });

  return csvString;
}

async function runTest() {
  // Test 1: Convert valid COAEP XLSX to CSV
  console.log("=== Test 1: Valid COAEP XLSX to CSV ===");

  // Check if the file exists
  const xlsxPath = path.join(
    __dirname,
    "TEST_BSCS-COAEP-BCS313L-OCa-CASIMERO-3.local.xlsx"
  );

  if (!fs.existsSync(xlsxPath)) {
    console.error(`❌ Error: File not found: ${xlsxPath}`);
    console.log(
      "\n💡 Place your Excel file in the test directory or update the path.\n"
    );
    return;
  }

  try {
    const csvData = convertXLSXtoCSV(xlsxPath);

    console.log("✅ Conversion successful!");
    console.log("\nCSV Output:");
    console.log("-".repeat(60));
    console.log(csvData);
    console.log("-".repeat(60));
    console.log(`\nTotal length: ${csvData.length} bytes\n`);
  } catch (error) {
    console.error("❌ Conversion failed:");
    console.error(error);
  }
}

runTest().catch(console.error);
