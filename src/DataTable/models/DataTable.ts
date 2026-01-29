import { convertToCSVFile } from "../../parser/xls";
import { ParserResult } from "../types/ParserResult";

import DataTableException from "../types/DataTableException";
import { DTValidator } from "./DTValidator";

export type DataTableInfo = {
  name: string;
  table: (string | null)[][];
  headers: string[];
};

export abstract class DataTable<T> {
  protected name: string;
  protected table: (string | null)[][] = [];
  protected headers: string[];
  protected validators: DTValidator<this, T>[] = [];

  constructor() {
    this.name = "DataTable";
    this.table = [];
    this.headers = [];
    this.validators = [] as DTValidator<this, T>[];
  }

  getName(): string {
    return this.name;
  }

  getHeaders(): string[] {
    return this.headers;
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
        name: this.name,
        table: this.table,
        headers: this.headers,
      } satisfies DataTableInfo,
    } as ParserResult<DataTableInfo>;
  }

  async setTable(table: (string | null)[][]): Promise<void> {
    await this.assertInitialized();
    this.table = table satisfies (string | null)[][];
  }

  abstract fromCSVString(
    csvString: string,
  ): Promise<ParserResult<DataTableInfo>>;

  abstract toJson(): Promise<
    ParserResult<{
      jsonObj: T | null;
      validMsgs: string[];
      tableErrors: DataTableException[];
    }>
  >;

  useValidator(validator: DTValidator<this, T>) {
    this.validators.push(validator);
  }

  async fromXML(
    xls: File,
    sheetName?: string,
  ): Promise<ParserResult<DataTableInfo>> {
    const csv: File = await convertToCSVFile(xls, sheetName);
    const csvString = await csv.text();

    return this.fromCSVString(csvString);
  }

  async findValue(str: string): Promise<{ row: number; column: number }> {
    await this.assertInitialized();
    for (let i = 0; i < this.table.length; i++) {
      for (let j = 0; j < this.table[i]!.length; j++) {
        if (this.table[i]![j] === str) {
          return { row: i, column: j };
        }
      }
    }
    return { row: -1, column: -1 };
  }

  async validate(): Promise<
    ParserResult<{ validMsgs: string[]; tableErrors: DataTableException[] }>
  > {
    const validMsgs: string[] = [];
    const tableErrors: DataTableException[] = [];

    try {
      this.assertInitialized()
        .then((msg: string) => {
          validMsgs.push(msg);
        })
        .catch((error: DataTableException) => tableErrors.push(error));

      const { success, message, error, data: toJsonData } = await this.toJson();

      if (!toJsonData) throw "Cannot access Json Object data.";

      validMsgs.push(...toJsonData.validMsgs);
      tableErrors.push(...toJsonData.tableErrors);

      const { jsonObj } = toJsonData;

      for (const validator of this.validators) {
        await validator.validate(validMsgs, tableErrors, this, jsonObj as T);
      }

      let returnMsg = `${this.name} ran its validations.`;
      if (validMsgs.length > 0)
        returnMsg += ` ${validMsgs.length} validations were successful.`;
      if (tableErrors.length > 0)
        returnMsg += ` ${tableErrors.length} validations failed.`;

      return {
        success: true,
        message: returnMsg,
        data: { validMsgs, tableErrors },
      } as ParserResult;
    } catch (error) {
      tableErrors.push({
        error:
          (error as string) ||
          `${this.name} failed to run all its validations.`,
        from: `${this.name}.validate()`,
        cause: error,
      });

      return {
        success: false,
        message: `${this.name} failed to run all its validations.` as string,
        data: { validMsgs, tableErrors },
      } as ParserResult;
    }
  }

  async assertInitialized(): Promise<string> {
    if (this.headers.length === 0)
      throw {
        error: `This ${this.name} is not initialized.`,
        from: "ASSERT_INIT",
      } as DataTableException;

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
}
