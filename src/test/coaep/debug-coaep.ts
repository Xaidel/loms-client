import Papa from "papaparse";
import * as fs from "fs";
import * as path from "path";
import getCoaepHeader from "../../helper/header-getter/getCoaepHeader";

const sampleFile = path.join(__dirname, "sample-coaep.csv");
const csvContent = fs.readFileSync(sampleFile, "utf-8");

const rows: string[][] = Papa.parse<string[]>(csvContent, {
  skipEmptyLines: false,
}).data as string[][];

console.log("Total rows:", rows.length);
console.log("\nFirst 5 rows:");
rows.slice(0, 5).forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});

const { headerRowIndex, coIdx, iloIdx, assessToolIdx, perfTargetIdx } =
  getCoaepHeader(rows);

console.log("\n=== Header Detection Results ===");
console.log("Header Row Index:", headerRowIndex);
console.log("CO Index:", coIdx);
console.log("ILO Index:", iloIdx);
console.log("Assessment Tool Index:", assessToolIdx);
console.log("Performance Target Index:", perfTargetIdx);

if (headerRowIndex !== -1) {
  console.log("\nHeader row content:");
  console.log(rows[headerRowIndex]);

  console.log("\nData rows (first 3):");
  rows.slice(headerRowIndex + 1, headerRowIndex + 4).forEach((row, i) => {
    console.log(`\nRow ${headerRowIndex + 1 + i}:`);
    console.log(`  CO Num [${coIdx}]: "${row[coIdx]}"`);
    console.log(`  CO Statement [${coIdx + 1}]: "${row[coIdx + 1]}"`);
    console.log(`  ILO [${iloIdx}]: "${row[iloIdx]}"`);
    console.log(
      `  Assessment Tool [${assessToolIdx}]: "${row[assessToolIdx]}"`
    );
    console.log(
      `  Performance Target [${perfTargetIdx}]: "${row[perfTargetIdx]}"`
    );
  });
}
