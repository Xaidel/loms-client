import { parseCOAEP } from "../parser/coaep";
import { convertToCSVFile } from "../parser/xls";
import { COAEP } from "../types/coaep";
import { ParserResult } from "../types/parserResult";

type parseSuccessReturn = {
  COAEP: COAEP;
};

type parseFailReturn = {
  error: string;
  message: string;
};

type parseReturn = parseSuccessReturn | parseFailReturn;

export async function getCOAEP(
  xls: File
): Promise<ParserResult<{ COAEP: COAEP }>> {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const res = parseCOAEP(data) as parseReturn;

    if ("error" in res) {
      return Promise.reject({
        success: false,
        message: res.message,
        error: res.error,
      } as ParserResult<{ COAEP: COAEP }>);
    }

    const result = {
      success: true,
      message: "Successfully parsed COAEP Data.",
      data: res as parseSuccessReturn,
    };

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing COAEP Data.",
      error,
    } as ParserResult<{ COAEP: COAEP }>);
  }
}
