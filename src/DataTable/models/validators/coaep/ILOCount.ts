import { COAEP } from "../../../../types/coaep";
import DataTableException from "../../../types/DataTableException";
import { CoaepDT } from "../../CoaepDT";
import { DTValidator } from "../../DTValidator";

const MIN_ILO_COUNT = 1;
const MAX_ILO_COUNT = 3;

export class ILOCount extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("ILO_COUNT");
  }

  /**
   * Validate the COAEP object.
   * Checks if every the ILO Arrays satisfy defined constraints.
   * If not, it will throw an error.
   *
   * @param {string[]} validMsgs - Array of valid messages.
   * @param {DataTableException[]} tableErrors - Array of table errors.
   * @param {CoaepDT} coaepDT - COAEP DataTable.
   * @param {COAEP | null} coaepObj - COAEP object.
   * @returns {Promise<void>} - Promise that resolves when validation is complete.
   */
  async validate(
    validMsgs: string[],
    tableErrors: DataTableException[],
    coaepDT: CoaepDT,
    coaepObj: COAEP | null,
  ): Promise<void> {
    const { success, data } = coaepDT.getTable();

    const localErrors: DataTableException[] = [];

    if (!success) {
      tableErrors.push({
        error: "Unable to access COAEP table.",
        from: this.name,
      });
      return;
    }

    const { table } = data!;

    // Accumulator/Counter
    let lastCO = "";
    let iloAcc = 1;
    let lastCORow = 0;

    for (let i = 0; i < table.length; i++) {
      // fetch CO number, Ilo array
      const [co_no, , ilo, ,] = table[i]!;

      // if new CO
      if (co_no) {
        //  check if last iloAcc is between MIN_ILO_COUNT and MAX_ILO_COUNT
        if (iloAcc < MIN_ILO_COUNT || iloAcc > MAX_ILO_COUNT) {
          localErrors.push({
            error: `CO ${lastCO} has ${iloAcc} ILOs. It can only have between ${MIN_ILO_COUNT} and ${MAX_ILO_COUNT} ILOs.`,
            row: lastCORow,
            column: 1,
            from: this.name,
          });
        }

        // reset iloAcc
        lastCO = co_no;
        lastCORow = i;
        iloAcc = 0;
      }

      // increment iloAcc if ilo exists
      if (ilo) iloAcc++;
    }

    // check again if last iloAcc is between MIN_ILO_COUNT and MAX_ILO_COUNT
    if (iloAcc < MIN_ILO_COUNT || iloAcc > MAX_ILO_COUNT) {
      localErrors.push({
        error: `CO ${lastCO} has ${iloAcc} ILOs. It can only have between ${MIN_ILO_COUNT} and ${MAX_ILO_COUNT} ILOs.`,
        row: lastCORow,
        column: 1,
        from: this.name,
      });
    }

    this.report(localErrors, validMsgs, tableErrors);
  }
}
