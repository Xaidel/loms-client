import DataTableException from "../types/DataTableException";

export abstract class DTValidator<DT, OBJ> {
  protected name: string;

  /**
   * Constructor for the DTValidator class.
   *
   * @param {string} name - The name of the validator.
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * @returns The name of the validator.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Helper function that updates the validMsgs and tableErrors arrays with a given localError array.
   *
   * @param localErrors - Local DataTableException throws of the validate method.
   * @param validMsgs - String array to append successful validation messages to.
   * @param tableErrors - DataTableException array to append error messages to.
   */
  report(
    localErrors: DataTableException[],
    validMsgs: string[],
    tableErrors: DataTableException[],
  ): void {
    if (localErrors.length > 0) tableErrors.push(...localErrors);
    else validMsgs.push(`${this.name} successfully validated.`);
  }

  /**
   * Method to validate the DataTable and its JSON object conversion.
   *
   * @param validMsgs - An array of strings to append successful validation messages to.
   * @param tableErrors - An array of DataTableException objects to append error messages to.
   * @param dataTable - The DataTable object to validate.
   * @param jsonObj - The associated JSON object to validate.
   * @returns A Promise that resolves when the validation is complete.
   */
  abstract validate(
    validMsgs: string[],
    tableErrors: DataTableException[],
    dataTable: DT,
    jsonObj: OBJ,
  ): Promise<void>;
}
