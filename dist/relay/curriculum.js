import { parseCurriculum } from "../parser/curriculum";
import Papa from "papaparse";
import { convertToCSVFile } from "../parser/xls";
export async function uploadCurriculum(url, xls) {
    try {
        const csv = await convertToCSVFile(xls);
        const data = await csv.text();
        const parsed = parseCurriculum(data);
        const sanitized = Papa.unparse(parsed);
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
