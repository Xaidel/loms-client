import { parseAssessmentCsv } from "../parser/assessmentdata"

export async function uploadAssessmentData(url: string, xls: File) {
  try {
    const data = await xls.text()
    const parsed = parseAssessmentCsv(data)
    console.log(JSON.stringify(parsed, null, 2))
  } catch (error) {
    throw error
  }
}
