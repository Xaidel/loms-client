import { parseAssessmentCsv } from "../parser/assessmentdata";
import { convertToCSVFile } from "../parser/xls";
import { AssessmentData } from "../types/assessmentdata";
import { ParserResult } from "../types/parserResult";

export const getAssessmentDataFromXLSX = async (
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
