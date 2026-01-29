import { ParserResult } from "../types/parserResult";
import DataTableException from "./DataTableException";

export type DataTableInfo = {
  name: string;
  table: (string | number)[][];
  headers: string[];
  types: ("string" | "number")[];
};

export abstract class DataTable<T = any> {
  name: string;
  protected table: (string | number)[][] = [];
  headers: string[];
  types: ("string" | "number")[];

  protected constructor() {
    this.name = "DataTable";
    this.table = [];
    this.headers = [];
    this.types = [];
  }

  abstract fromXML(xls: File): Promise<ParserResult<DataTableInfo>>;

  abstract validate(): Promise<
    ParserResult<{ tableErrors: DataTableException[] }>
  >;

  abstract toJson(): Promise<ParserResult<T>>;

  assertInitialized(): void {
    if (this.headers.length === 0) {
      throw new Error("The table is uninitialized.");
    }
  }

  async setTable(xls: File): Promise<ParserResult> {
    const parseResult = await this.fromXML(xls);

    // case error
    if (!parseResult.success || !parseResult.data) return parseResult;

    // case success
    const {
      table: _table,
      headers: _headers,
      types: _types,
    } = parseResult.data;

    this.table = _table;
    this.headers = _headers;
    this.types = _types;

    return {
      success: true,
      message: parseResult.message,
    } as ParserResult;
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
        types: this.types,
      } as DataTableInfo,
    } as ParserResult<DataTableInfo>;
  }
}

// const dataTable = new DataTable(csvString);

// dataTable.getTable(): [][]

// dataTable.updateTable(dataTable[][]) : errors[]

// dataTable.validate(dataTable[][]) : errors[]

// dataTable.toJson(): Record<string, any>
