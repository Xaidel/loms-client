import { parseCOAEP } from "../parser/coaep"
import { convertToCSVFile } from "../parser/xls"

export async function uploadCOAEP(url: string, xls: File, course_id: string) {
  try {
    const csv = await convertToCSVFile(xls)
    const data = await csv.text()
    const parsed = parseCOAEP(data)
    const res = await fetch(`${url}/coaeps/upload?course_id=${course_id}`, {
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
