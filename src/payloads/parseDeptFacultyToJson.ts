import { convertToCSVFile } from "../parser/xls";
import { parseDeptFaculty } from "../parser/deptfaculty";
import { ParserResult } from "../DataTable/types/ParserResult";
import { DeptFaculty, Faculty, User } from "../types/deptfaculty";

/**
 * Parses the department faculty from an Excel file and returns three JSON arrays for bulk upload.
 * @param xls - The Department Faculty Template Excel file to parse
 * @returns ParserResult<{ faculties: Faculty[], deptFaculties: DeptFaculty[], users: User[] }>
 */
export const parseDeptFacultyToJson = async (
  xls: File,
): Promise<
  ParserResult<{ faculties: any[]; deptFaculties: any[]; users: any[] }>
> => {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const parsedData = parseDeptFaculty(data);

    const result: ParserResult<{
      faculties: Faculty[];
      deptFaculties: DeptFaculty[];
      users: User[];
    }> = {
      success: true,
      message: "Successfully parsed Dept Faculty.",
      data: {
        faculties: parsedData.faculties,
        deptFaculties: parsedData.deptFaculties,
        users: parsedData.users,
      },
    };

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing Dept Faculty.",
      error,
    } as ParserResult<{
      faculties: any[];
      deptFaculties: any[];
      users: any[];
    }>);
  }
};
