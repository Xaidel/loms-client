"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCSVFile = convertToCSVFile;
const XLSX = __importStar(require("xlsx"));
function convertToCSVFile(xls) {
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
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) {
                    reject(new Error("No sheets found in workbook"));
                    return;
                }
                const workSheet = workbook.Sheets[sheetName];
                if (!workSheet) {
                    reject(new Error("No sheets found in worksheet"));
                    return;
                }
                const csvString = XLSX.utils.sheet_to_csv(workSheet);
                // Create a new File from the CSV string
                // Use the original filename but replace extension with .csv
                const csvFileName = xls.name.replace(/\.[^/.]+$/, ".csv");
                const csvFile = new File([csvString], csvFileName, {
                    type: "text/csv",
                    lastModified: Date.now(),
                });
                resolve(csvFile);
            }
            catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => {
            reject(new Error("File reading failed"));
        };
        reader.readAsArrayBuffer(xls);
    });
}
