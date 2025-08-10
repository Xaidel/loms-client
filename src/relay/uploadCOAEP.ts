import { convertToCSVFile } from "../parser/xls"
import { parseCOAEP } from "../parser/coaep"

export async function uploadCOAEP(xls: File) {
  try {
    //const csv = await convertToCSVFile(xls)
    const data = await xls.text()
    const parsed = parseCOAEP(data)
    console.log(JSON.stringify(parsed, null, 2));
  } catch (error) {
    throw error
  }
}
