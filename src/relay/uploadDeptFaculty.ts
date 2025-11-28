import { convertToCSVFile } from "../parser/xls";

export async function uploadDeptFaculty(
  url: string,
  xls: File
): Promise<Record<string, unknown>> {
  try {
    const csv = await convertToCSVFile(xls);
    const formData = new FormData();
    formData.append("csvFile", csv);

    const res = await fetch(`${url}/dept-faculties/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }
    return res.json() as Promise<Record<string, unknown>>;
  } catch (error) {
    throw error;
  }
}
