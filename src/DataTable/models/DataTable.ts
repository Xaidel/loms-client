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

  async setTable(table: (string | null)[][]): Promise<void> {
    await this.assertInitialized();
    this.table = table;
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

  useValidator(validator: DTValidator<this, T>) {
    this.validators.push(validator);
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

  // async validateToJson(
  //   validMsgs: string[],
  //   tableErrors: DataTableException[],
  // ): Promise<ParserResult<T>> {
  //   const { success, message, data, error } = await this.toJson();
  //   const dteFrom = `${this.name}_TO_JSON`;

  //   if (!success || !data) {
  //     if (error?.tableErrors) tableErrors.push(...error.tableErrors);
  //     else
  //       tableErrors.push({
  //         error: `${this.name} failed to convert to JSON object.`,
  //         from: dteFrom,
  //       });

  //     return {
  //       success: false,
  //       message: `${this.name} failed to convert to JSON object.`,
  //     } as ParserResult;
  //   }

  //   validMsgs.push(`${this.name} successfully converted to JSON object.`);
  //   return {
  //     success: true,
  //     message: `${this.name} successfully converted to JSON object.`,
  //     data,
  //   } as ParserResult;
  // }

  async validate(): Promise<
    ParserResult<{ validMsgs: string[]; tableErrors: DataTableException[] }>
  > {
    let isSuccess = true;

    const validMsgs: string[] = [];
    const tableErrors: DataTableException[] = [];

    try {
      this.assertInitialized()
        .then((msg: string) => {
          validMsgs.push(msg);
        })
        .catch((error: DataTableException) => tableErrors.push(error));

      // const {
      //   success,
      //   message,
      //   data: jsonObj,
      //   error,
      // } = await this.validateToJson(validMsgs, tableErrors);
      // if (error) throw error;

      const { success, message, error, data: toJsonData } = await this.toJson();

      if (!toJsonData) throw error;

      validMsgs.push(...toJsonData.validMsgs);
      tableErrors.push(...toJsonData.tableErrors);

      if (!toJsonData.jsonObj) throw error;

      const { jsonObj } = toJsonData;

      for (const validator of this.validators) {
        await validator.validate(validMsgs, tableErrors, this, jsonObj as T);
      }

      return {
        success,
        message,
        data: {
          validMsgs,
          tableErrors,
        },
      };
    } catch (error) {
      isSuccess = false;
      tableErrors.push({
        error:
          (error as string) ||
          `${this.name} failed to run all its validations.`,
        from: `${this.name}.validate()`,
      });
    } finally {
      return {
        success: isSuccess,
        message: isSuccess
          ? `${this.name} successfully ran its validations.`
          : undefined,
        error: isSuccess
          ? undefined
          : `${this.name} failed to run all its validations.`,
        data: { validMsgs, tableErrors },
      } as ParserResult;
    }
  }

  abstract toJson(): Promise<
    ParserResult<{
      jsonObj: T | null;
      validMsgs: string[];
      tableErrors: DataTableException[];
    }>
  >;

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
}
