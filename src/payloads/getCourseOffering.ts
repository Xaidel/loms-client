import Papa from "papaparse";
import { convertToCSVFile } from "../parser/xls";
import { parseCourseOffering } from "../parser/courseOffering";
import { ParserResult } from "../types/parserResult";
import { CourseOffering } from "../types/courseOffering";

const getCourseOffering = async (
  xls: File
): Promise<ParserResult<{ courseOfferings: CourseOffering[] }>> => {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const courseOfferings = parseCourseOffering(data);

    const result: ParserResult<{ courseOfferings: CourseOffering[] }> = {
      success: true,
      message: "Successfully parsed Course Offering.",
      data: {
        courseOfferings: courseOfferings,
      },
    };

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing Course Offering.",
      error,
    } as ParserResult<{ courseOfferings: CourseOffering[] }>);
  }
};

export default getCourseOffering;
