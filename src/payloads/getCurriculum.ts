import { parseCurriculum } from "../parser/curriculum";
import { convertToCSVFile } from "../parser/xls";
import { ParserResult } from "../types/parserResult";
import { CurriculumCourses } from "../types/curriculum";

export const getCurriculumFromXLSX = async (
  xls: File,
): Promise<ParserResult<{ curriculums: CurriculumCourses[] }>> => {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const curriculum = parseCurriculum(data);

    const result: ParserResult<{ curriculums: CurriculumCourses[] }> = {
      success: true,
      message: "Successfully parsed Curriculum.",
      data: {
        curriculums: curriculum,
      },
    };

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing Curriculum.",
      error,
    } as ParserResult<{ curriculums: CurriculumCourses[] }>);
  }
};
