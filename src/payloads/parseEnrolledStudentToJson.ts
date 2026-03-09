import { convertToCSVFile } from "../parser/xls";
import { ParserResult } from "../DataTable/types/ParserResult";
import {
  enrolledStudentsCsvRow,
  parseEnrolledStudents,
} from "../parser/enrolledstudents";

/**
 * Parses the enrolled students from an Excel file and returns a FormData object of the excel file wrapped in a ParserResult.
 *
 * @param xls - The Enrolled Students Template Excel file to parse
 * @returns ParserResult<{enrolledStudents: enrolledStudentsCsvRow[]}>
 */
export const parseEnrolledStudentsToJson = async (
  xls: File,
): Promise<ParserResult<{ enrolledStudents: enrolledStudentsCsvRow[] }>> => {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const parsedData = parseEnrolledStudents(data);

    const result: ParserResult<{ enrolledStudents: enrolledStudentsCsvRow[] }> =
      {
        success: true,
        message: "Successfully parsed Enrolled Students.",
        data: {
          enrolledStudents: parsedData.enrolledStudents,
        },
      };
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing Enrolled Students.",
      error,
    } as ParserResult<{ enrolledStudents: enrolledStudentsCsvRow[] }>);
  }
};
