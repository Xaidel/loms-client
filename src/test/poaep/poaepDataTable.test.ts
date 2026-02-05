// /*
//   npx tsx src\test\poaep\poaepDataTable.test.ts
// */

// import * as fs from "fs";
// import * as path from "path";
// import * as XLSX from "xlsx";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import { PoaepDT } from "../../DataTable/models/PoaepDT";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const sampleFilePath = path.join(__dirname, "test_file.local.xlsx");

// let validCoaepCSV = "";

// if (fs.existsSync(sampleFilePath)) {
//   try {
//     const fileBuffer = fs.readFileSync(sampleFilePath);
//     const workbook = XLSX.read(fileBuffer, { type: "buffer" });

//     const sheetName = workbook.SheetNames[0];
//     if (sheetName) {
//       const workSheet = workbook.Sheets[sheetName];
//       if (workSheet) {
//         validCoaepCSV = XLSX.utils.sheet_to_csv(workSheet);
//       } else {
//         console.error("Worksheet not found");
//       }
//     } else {
//       console.error("No sheets found in workbook");
//     }
//   } catch (error) {
//     console.error("Error reading Excel file:", error);
//   }
// } else {
//   console.error("Sample COAEP Excel file not found at:", sampleFilePath);
// }

// console.log("=== Test 1: Valid COAEP CSV ===");

// const poaepDT = new PoaepDT();

// // initialize with CSV
// console.log("== Initialize with CSV ===");
// console.dir(await poaepDT.initializeTable(validCoaepCSV), { depth: null });

// // Fetch table Data
// console.log("== Fetch Table Data ===");
// const result1 = poaepDT.getTable();
// console.dir(result1, { depth: null });

// // // Update table data
// // console.log("== Update Table Data ===");
// // let table = result1.data!.table;
// // table[0]![3] = "New Assessment tool";
// // await poaepDT.setTable(table);
// // let result2 = await poaepDT.toJson();
// // console.dir(result2!.data!.jsonObj!.co[0]!.ilo[0], { depth: null });

// // // validation
// // console.log("== Validation ===");
// // const result3 = await poaepDT.validate();
// // console.dir(result3, { depth: null });

// // // // Convert to JSON
// // console.log("== Convert to JSON ===");
// // const result4 = await poaepDT.toJson();
// // console.dir(result4, { depth: null });

// console.log("=== All Tests Complete ===");
