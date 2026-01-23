import { convertToCSVFile } from "../parser/xls";
import { ParserResult } from "../types/parserResult";
import DataTableException from "./DataTableException";

export type DataTableInfo = {
  name: string;
  table: (string | null)[][];
  headers: string[];
};

export abstract class DataTable<T = any> {
  name: string;
  protected table: (string | null)[][] = [];
  headers: string[];

  protected constructor() {
    this.name = "DataTable";
    this.table = [];
    this.headers = [];
  }

  abstract fromCSVString(
    csvString: string,
  ): Promise<ParserResult<DataTableInfo>>;

  async fromXML(
    xls: File,
    sheetName?: string,
  ): Promise<ParserResult<DataTableInfo>> {
    const csv: File = await convertToCSVFile(xls, sheetName);
    const csvString = await csv.text();

    return this.fromCSVString(csvString);
  }

  abstract validate(): Promise<
    ParserResult<{ validMsgs: string[]; tableErrors: DataTableException[] }>
  >;

  abstract toJson(): Promise<ParserResult<T>>;

  async assertInitialized(): Promise<string> {
    if (this.headers.length === 0)
      return Promise.reject("The table is not initialized.");

    return Promise.resolve("The table is initialized.");
  }

  async initializeTable(data: File | string): Promise<ParserResult> {
    try {
      let parseResult;

      // case File
      if (data instanceof File) parseResult = await this.fromXML(data);
      // case CSV String
      else parseResult = await this.fromCSVString(data);

      // case error
      if (!parseResult.success || !parseResult.data) return parseResult;

      if (parseResult.data.table.length === 0) {
        throw new Error("Cannot set an empty table.");
      }

      // case success
      const { table: _table, headers: _headers } = parseResult.data;

      this.table = _table;
      this.headers = _headers;

      return {
        success: true,
        message: "Successfully set table.",
      } as ParserResult;
    } catch (error) {
      return {
        success: false,
        message: "Error setting table.",
        error: error,
      } as ParserResult;
    }
  }

  async setTable(table: (string | null)[][]): Promise<void> {
    await this.assertInitialized();
    this.table = table;
  }

  getTable(): ParserResult<DataTableInfo> {
    if (this.table.length === 0) {
      return {
        success: false,
        message: "Datatable is unset.",
      } as ParserResult;
    }

    return {
      success: true,
      message: "Successfully fetched datatable.",
      data: {
        table: this.table,
        headers: this.headers,
      } as DataTableInfo,
    } as ParserResult<DataTableInfo>;
  }
}
