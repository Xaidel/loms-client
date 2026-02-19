import { convertToCSVFile } from "../../parser/xls";
import { ParserResult } from "../types/ParserResult";

import DataTableException from "../types/DataTableException";
import { DTValidator } from "./DTValidator";

export type DataTableInfo<RowType = any[]> = {
  name: string;
  headers: string[];
  table: RowType[];
  state: Record<string, any>;
};

/**
 * An abstract class that wraps a tabular data structure
 * and provides methods for state management, validation, CSV parsing, and JSON conversion.
 *
 * @template Obj - The type of the DataTable JSON output.
 * @template RowType - The type of each row of the inner table.
 */
export abstract class DataTable<Obj, RowType> {
  protected name: string;
  protected headers: string[];
  protected table: RowType[];
  protected validators: DTValidator<this, Obj>[] = [];
  protected state: Record<string, any> = {};

  /**
   * Creates a new DataTable, initializes default values.
   * If no name is given, the name defaults to "DataTable".
   *
   * @template Obj - The type of the DataTable JSON output.
   * @template RowType - The type of each row of the inner table.
   *
   * @param {string} _name - The name of the DataTable. Defaults to "DataTable".
   * @param {string[]} _headers - String containing the headers of the DataTable.
   */
  constructor(_name: string = "DataTable", _headers: string[]) {
    this.name = _name;
    this.headers = _headers;

    this.table = [];
    this.validators = [] as DTValidator<this, Obj>[];
    this.state = {};
  }

  /**
   * Returns the name of the DataTable.
   * @returns string
   */
  getName(): string {
    return this.name;
  }
  /**
   * Returns the header names of the DataTable.
   * @returns array of strings
   */
  getHeaders(): string[] {
    return this.headers;
  }

  /**
   * Returns the state of the DataTable.
   * @returns Record<string, any>
   */
  getState(): Record<string, any> {
    return this.state;
  }

  /**
   * Sets the state of the DataTable.
   * @param state - Record<string, any>
   */
  setState = async (state: Record<string, any>) => {
    await this.assertInitialized();
    this.state = state;
  };

  /**
   * Gets the DataTable from the current object.
   * @returns ParserResult<DataTableInfo>
   */
  getTable(): ParserResult<DataTableInfo<RowType>> {
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
        headers: this.headers,
        table: this.table,
        state: this.state,
      } satisfies DataTableInfo<RowType>,
    } as ParserResult<DataTableInfo<RowType>>;
  }

  /**
   * Sets the DataTable from a given table.
   * Asserts first if the DataTable is initialized,
   * then checks if the number of columns matches the number of headers.
   *
   * @param table - Internal table of type (string | null)[][].
   * @returns A Promise that resolves when the table has been set.
   */
  async setTable(table: RowType[]): Promise<void> {
    await this.assertInitialized();

    this.table = table;
  }

  /**
   * Populates the internal table from a given File or CSV string.
   *
   * If the data is a File, it will be parsed using the fromXML method.
   * If the data is a CSV string, it will be parsed using the fromCSVString method.
   *
   * @param {File | string} data - The File or CSV string to initialize the DataTable from.
   * @returns A Promise that resolves to a ParserResult.
   */
  async initializeTable(
    data: File | string,
    sheetName?: string,
  ): Promise<ParserResult<RowType[]>> {
    try {
      let parseResult: ParserResult<RowType[]>;

      // case File
      if (data instanceof File)
        parseResult = await this.fromXML(data, sheetName);
      // case CSV String
      else parseResult = await this.fromCSVString(data);

      // case error
      if (!parseResult.success || !parseResult.data) return parseResult;

      if (parseResult.data.length === 0) {
        throw new Error("Cannot set an empty table.");
      }

      // case success
      this.table = parseResult.data satisfies RowType[];

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

  /**
   * Asserts that the DataTable has been initialized.
   * If not, it throws a DataTableException.
   *
   * @throws {DataTableException} If the DataTable has not been initialized.
   */
  async assertInitialized(): Promise<void> {
    if (this.table.length === 0)
      Promise.reject({
        error: `${this.name} is unset.`,
        from: `${this.name.toUpperCase()}_ASSERT_INIT`,
      } as DataTableException);
  }

  /**
   * Parses a CSV string into a DataTable.
   *
   * @param csvString - The CSV string to parse.
   * @returns A Promise that resolves to a ParserResult when the parsing is complete.
   */
  abstract fromCSVString(csvString: string): Promise<ParserResult<RowType[]>>;

  /**
   * Converts the DataTable to its JSON representation.
   * The method will run all validators on the DataTable before conversion.
   * If any validator fails, it will append the error message to the tableErrors array.
   * If all validators pass, it will append the successful validation messages to the validMsgs array.
   *
   * @returns A Promise that resolves when the conversion is complete.
   */
  abstract toJson(): Promise<
    ParserResult<{
      jsonObj: Obj;
      validMsgs: string[];
      tableErrors: DataTableException[];
    }>
  >;

  /**
   * Method to set the internal table from an Excel file (.xls).
   * This converts the file to CSVstring and calls the fromCSVString method.
   *
   * @param xls - The Excel file (.xls) to set the DataTable from.
   * @param sheetName - Optional sheetname to set the DataTable from. Defaults to 1st sheet.
   * @returns A Promise that resolves to a ParserResult when the DataTable is set.
   */
  async fromXML(
    xls: File,
    sheetName?: string,
  ): Promise<ParserResult<RowType[]>> {
    const csv: File = await convertToCSVFile(xls, sheetName);
    const csvString = await csv.text();

    return this.fromCSVString(csvString);
  }

  /**
   * Searches for all instances of a provided value in a row of the DataTable.
   *
   * @param {RowType} rowData - The row to search in.
   * @param {any} val - The value to lookup.
   * @returns {{column: number}[]} - A list of lookup column indices.
   */
  abstract searchRow(rowData: RowType, val: any): { column: number }[];

  /**
   * Searches for all instances of a provided value in the DataTable.
   *
   * @param {any} val - The value to lookup.
   * @returns {Promise<{ row: number; column: number }[]>} - A promise resolving to a list of lookup indices. Defaults to [] if not found.
   */
  async searchTable(val: any): Promise<{ row: number; column: number }[]> {
    await this.assertInitialized().catch(() => {
      return [];
    });
    if (!val) return [];

    const indices: { row: number; column: number }[] = [];

    for (let i = 0; i < this.table.length; i++) {
      const rowData = this.table[i]! as RowType;
      const cols = this.searchRow(rowData, val);
      for (const col of cols) {
        indices.push({ row: i, column: col.column });
      }
    }

    return indices;
  }

  /**
   * Runs all validators on the DataTable.
   * By default runs the validations of the validateFields and toJson methods.
   * If any validator fails, it will append the error message to the tableErrors array.
   * If all validators pass, it will append the successful validation messages to the validMsgs array.
   *
   * @returns A Promise that resolves with a ParserResult containing the validation results.
   * The data object within the ParserResult contains the arrays of valid messages and table errors.
   */
  async validate(): Promise<
    ParserResult<{ validMsgs: string[]; tableErrors: DataTableException[] }>
  > {
    const validMsgs: string[] = [];
    const tableErrors: DataTableException[] = [];

    try {
      await this.assertInitialized()
        .then(() => {
          validMsgs.push("Table is initialized.");
        })
        .catch((error: DataTableException) => tableErrors.push(error));

      if (tableErrors.length > 0) throw "Cannot validate uninitialized table.";

      await this.validateFields(validMsgs, tableErrors);

      const { success, message, error, data: toJsonData } = await this.toJson();

      if (!toJsonData) throw "Cannot access Json Object data.";

      validMsgs.push(...toJsonData.validMsgs);
      tableErrors.push(...toJsonData.tableErrors);

      const { jsonObj } = toJsonData;

      for (const validator of this.validators) {
        await validator.validate(validMsgs, tableErrors, this, jsonObj as Obj);
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
        error: `${this.name} failed to run all its validations.`,
        from: `${this.name.toUpperCase()}_VALIDATE`,
        cause: error,
      });

      return {
        success: false,
        message: `${this.name} failed to run all its validations.` as string,
        data: { validMsgs, tableErrors },
      } as ParserResult;
    }
  }

  /**
   * Validates all fields in the DataTable.
   *
   * @param {string[]} validMsgs - Array of valid messages.
   * @param {DataTableException[]} tableErrors - Array of table errors.
   * @returns {Promise<void>} - A promise that resolves when the validation is complete.
   */
  abstract validateFields(
    validMsgs: string[],
    tableErrors: DataTableException[],
  ): Promise<void>;

  /**
   * Adds a custom validator to the DataTable.
   * This validator will be called when the validate method is called.
   *
   * @param validator - The validator to add to the DataTable.
   */
  useValidator(validator: DTValidator<this, Obj>) {
    this.validators.push(validator);
  }
}
