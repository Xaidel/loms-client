"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uploadCurriculum;
const curriculum_1 = require("../parser/curriculum");
const papaparse_1 = __importDefault(require("papaparse"));
const xls_1 = require("../parser/xls");
async function uploadCurriculum(url, xls) {
    try {
        const csv = await (0, xls_1.convertToCSVFile)(xls);
        const data = await csv.text();
        const parsed = (0, curriculum_1.parseCurriculum)(data);
        const sanitized = papaparse_1.default.unparse(parsed);
        const sanitizedCsv = new File([sanitized], csv.name, { type: "text/csv" });
        const formData = new FormData();
        formData.append("csvFile", sanitizedCsv);
        const res = await fetch(`${url}/curr-courses/upload`, {
            method: "POST",
            body: formData
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw errorData;
        }
        return res.json();
    }
    catch (error) {
        throw error;
    }
}
