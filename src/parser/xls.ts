import * as XLSX from "xlsx";

export function convertToCSVFile(xls: File, sheetName?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) {
        reject(new Error("Failed to read file"));
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "array" });

        // const sheetName = workbook.SheetNames[0] ;
        if (!sheetName) {
          sheetName = workbook.SheetNames[0];
        }

        if (!sheetName) {
          reject(new Error("No sheets found in workbook"));
          return;
        }

        const workSheet = workbook.Sheets[sheetName];
        if (!workSheet) {
          reject(new Error("No sheets found in worksheet"));
          return;
        }

        // Convert the worksheet to a CSV string
        // Removes empty columns
        const csvString = XLSX.utils.sheet_to_csv(workSheet, { strip: true });

        // Create a new File from the CSV string
        // Use the original filename but replace extension with .csv
        const csvFileName = xls.name.replace(/\.[^/.]+$/, ".csv");

        const csvFile = new File([csvString], csvFileName, {
          type: "text/csv",
          lastModified: Date.now(),
        });

        resolve(csvFile);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("File reading failed"));
    };

    reader.readAsArrayBuffer(xls);
  });
}
