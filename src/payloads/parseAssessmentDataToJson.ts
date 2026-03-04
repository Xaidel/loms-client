import { parseAssessmentCsv } from "../parser/assessmentdata";
import { convertToCSVFile } from "../parser/xls";
import { AssessmentData } from "../types/assessmentdata";
import { ParserResult } from "../DataTable/types/ParserResult";

/**
 * Parses the assessment data from an Excel file and returns an AssessmentData object wrapped in a ParserResult.
 * @param xls - The AssessmentData Template Excel file to parse
 * @returns ParserResult<{ assessmentData: AssessmentData }>
 */
export const parseAssessmentDataToJson = async (
  xls: File,
): Promise<ParserResult<{ assessmentData: AssessmentData }>> => {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const assessmentData = parseAssessmentCsv(data);

    const result: ParserResult<{ assessmentData: AssessmentData }> = {
      success: true,
      message: "Successfully parsed Assessment Data.",
      data: assessmentData,
    };

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing Assessment Data.",
      error,
    } as ParserResult<{ assessmentData: AssessmentData }>);
  }
};
