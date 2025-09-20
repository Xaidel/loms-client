import { parseAssessmentCsv } from "../parser/assessmentdata"
import { convertToCSVFile } from "../parser/xls"

export async function uploadAssessmentData(url: string, xls: File) {
  try {
    const csv = await convertToCSVFile(xls)
    const data = await csv.text()
    const parsed = parseAssessmentCsv(data)
    const res = await fetch(`${url}/assessment-data/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed)
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
