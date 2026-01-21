import { convertToCSVFile } from "../parser/xls";
import { ParserResult } from "../types/parserResult";

export const getDeptFacultyFromXLSX = async (
  xls: File,
): Promise<ParserResult<{ body: FormData }>> => {
  try {
    const csv = await convertToCSVFile(xls);
    const formData = new FormData();
    formData.append("csvFile", csv);

    const result: ParserResult<{ body: FormData }> = {
      success: true,
      message: "Successfully parsed Dept Faculty.",
      data: {
        body: formData,
      },
    };
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing Dept Faculty.",
      error,
    } as ParserResult<{ body: FormData }>);
  }
};
