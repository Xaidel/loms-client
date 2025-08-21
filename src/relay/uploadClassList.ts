import { parseClassList } from "../parser/classList";
import { convertToCSVFile } from "../parser/xls";

export async function uploadClassList(url: string, xls: File) {
  try {
    const csv = await convertToCSVFile(xls)
    const data = await csv.text();
    const parsed = parseClassList(data)
    const res = await fetch(`${url}/enrolled-courses/upload`, {
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
