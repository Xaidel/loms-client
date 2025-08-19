import { parseClassList } from "../parser/classList";
import Papa from "papaparse"
import { convertToCSVFile } from "../parser/xls"

export async function uploadClassList(url: string, xls: File): Promise<Record<string, unknown>> {
    try {
        const csv = await convertToCSVFile(xls)
        const data = await csv.text()
        const parsed = parseClassList(data)
        const sanitized = Papa.unparse(parsed)
        const sanitizedCsv = new File([sanitized], csv.name, { type: "text/csv" })

        const formData = new FormData()
        formData.append("csvFile", sanitizedCsv)

        const res = await fetch(`${url}/class-list/upload`, {
            method: "POST",
            body: formData
        })
        if (!res.ok) {
            const errorData = await res.json()
            throw errorData
        }
        return res.json() as Promise<Record<string, unknown>>
    } catch (error) {
        throw error
    }
}