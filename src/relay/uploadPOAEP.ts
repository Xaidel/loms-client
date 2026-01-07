import { parsePOAEP } from "../parser/poaep";
import { convertToCSVFile } from "../parser/xls";

export async function uploadPOAEP(
  url: string,
  xls: File,
  token: string,
  course_id: string,
  curr_id: string,
  period_id: number
) {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const parsed = parsePOAEP(data);
    const res = await fetch(
      `${url}/poaeps/upload?course_id=${course_id}&curr_id=${curr_id}&period_id=${period_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(parsed),
      }
    );
    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }
    return res.json() as Promise<Record<string, unknown>>;
  } catch (error) {
    throw error;
  }
}
