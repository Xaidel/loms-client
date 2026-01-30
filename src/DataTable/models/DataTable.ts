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

  /**
   * Creates a new DataTable, initializes default values.
   * If no name is given, the name defaults to "DataTable".
   *
   * @param {string} _name - The name of the DataTable. Defaults to "DataTable".
   */
  constructor(_name: string = "DataTable") {
    this.name = _name;
    this.table = [];
    this.headers = [];
    this.validators = [] as DTValidator<this, T>[];
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
   * Gets the DataTable from the current object.
   * @returns ParserResult<DataTableInfo>
   */
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

  /**
   * Sets the DataTable from a given table.
   * Asserts first if the DataTable is initialized,
   * then checks if the number of columns matches the number of headers.
   *
   * @param table - Internal table of type (string | null)[][].
   * @returns A Promise that resolves when the table has been set.
   */
  async setTable(table: (string | null)[][]): Promise<void> {
    await this.assertInitialized();

    // check if number of columns matches number of headers
    if (table[0]!.length !== this.headers.length)
      Promise.reject(
        new Error("Number of columns does not match number of headers."),
      );

    this.table = table satisfies (string | null)[][];
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

  /**
   * Asserts that the DataTable has been initialized.
   * If not, it throws a DataTableException.
   *
   * @returns A Promise that resolves with a string message.
   * @throws {DataTableException} If the DataTable has not been initialized.
   */
  async assertInitialized(): Promise<string> {
    if (this.headers.length === 0)
      throw {
        error: `This ${this.name} is not initialized.`,
        from: "ASSERT_INIT",
      } as DataTableException;

    return Promise.resolve("The table is initialized.");
  }

  /**
   * Parses a CSV string into a DataTable.
   *
   * @param csvString - The CSV string to parse.
   * @returns A Promise that resolves to a ParserResult when the parsing is complete.
   */
  abstract fromCSVString(
    csvString: string,
  ): Promise<ParserResult<DataTableInfo>>;

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
      jsonObj: T | null;
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
  ): Promise<ParserResult<DataTableInfo>> {
    const csv: File = await convertToCSVFile(xls, sheetName);
    const csvString = await csv.text();

    return this.fromCSVString(csvString);
  }

  /**
   * Finds the row and column index of a given string in the DataTable.
   *
   * @param {string} str - The string to search for.
   * @returns {Promise<{ row: number; column: number }>} - A promise resolving to the indices. Defaults to {row: -1, column: -1} if not found.
   */
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

  /**
   * Runs all validators on the DataTable.
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
        .then((msg: string) => {
          validMsgs.push(msg);
        })
        .catch((error: DataTableException) => tableErrors.push(error));

      if (tableErrors.length > 0) throw "Cannot validate uninitialized table.";

      await this.validateFields(validMsgs, tableErrors);
      // if (tableErrors.length > 0)
      //   throw "Cannot convert to JSON with invalid fields.";

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
   * Adds a validator to the DataTable.
   * This validator will be called when the validate method is called.
   *
   * @param validator - The validator to add to the DataTable.
   */
  useValidator(validator: DTValidator<this, T>) {
    this.validators.push(validator);
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
}
