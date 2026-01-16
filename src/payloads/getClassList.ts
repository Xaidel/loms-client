import { parseClassList } from "../parser/classList";
import { convertToCSVFile } from "../parser/xls";
import { classList } from "../types/classList";
import { ParserResult } from "../types/parserResult";

const getClassList = async (
  xls: File
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
      message: "Error parsing Assessment Data.",
      error,
    } as ParserResult<{ enrolledCourses: classList[] }>);
  }
};

export default getClassList;
