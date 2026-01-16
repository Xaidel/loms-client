import parsePOAEP from "../parser/poaep";
import { convertToCSVFile } from "../parser/xls";
import { ParserResult } from "../types/parserResult";
import { PO } from "../types/poaep";

const getPOAEP = async (xls: File): Promise<ParserResult<{ POAEP: PO[] }>> => {
  try {
    const csv = await convertToCSVFile(xls);
    const data = await csv.text();
    const result = parsePOAEP(data) as ParserResult<{ POAEP: PO[] }>;

    if (!result.success) {
      return Promise.reject(result);
    }

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject({
      success: false,
      message: "Error parsing POAEP.",
      error,
    } as ParserResult<{ POAEP: PO[] }>);
  }
};

export default getPOAEP;
