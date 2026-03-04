import { parseClassList } from "../parser/classList";
import { convertToCSVFile } from "../parser/xls";
import { classList } from "../types/classList";
import { ParserResult } from "../DataTable/types/ParserResult";

/**
 * Parses the class list from an Excel file and returns a classList object wrapped in a ParserResult.
 * @param xls - The Classlist Template Excel file to parse
 * @returns ParserResult<{ enrolledCourses: classList[] }>
 */
export const parseClassListToJson = async (
  xls: File,
): Promise<ParserResult<{ enrolledCourses: classList[] }>> => {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const classList = parseClassList(data);

    const result: ParserResult<{ enrolledCourses: classList[] }> = {
      success: true,
      message: "Successfully parsed Class List.",
      data: classList,
    };

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing Class List.",
      error,
    } as ParserResult<{ enrolledCourses: classList[] }>);
  }
};
