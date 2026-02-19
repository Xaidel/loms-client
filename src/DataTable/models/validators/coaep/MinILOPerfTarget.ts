import { COAEP } from "../../../../types/coaep";
import DataTableException from "../../../types/DataTableException";
import { CoaepDT } from "../../CoaepDT";
import { DTValidator } from "../../DTValidator";

const minPerfTarget = 50;
const minPassScore = 50;

export class MinILOPerfTarget extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("MIN_ILO_PERF_TARGET");
  }

  /**
   * Validate the COAEP object.
   * Checks if every ILO has a performance target and pass score of at least 50.
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
      localErrors.push({
        error: "Unable to access COAEP table.",
        from: this.name,
      });
      return;
    }

    const { table } = data!;

    for (let i = 0; i < table.length; i++) {
      const row = table[i]!;
      const [perfTarget, passScore] = row[4] as (number | null)[];

      if (!perfTarget)
        localErrors.push({
          error: "Performance target is required.",
          row: i,
          column: 4,
          from: this.name,
        });
      else if (perfTarget < minPerfTarget) {
        localErrors.push({
          error: `Performance target must be at least ${minPerfTarget}.`,
          row: i,
          column: 4,
          from: this.name,
        });
      }

      if (!passScore)
        localErrors.push({
          error: "Passing score is required.",
          row: i,
          column: 4,
          from: this.name,
        });
      else if (passScore < minPassScore) {
        localErrors.push({
          error: `Passing score must be at least ${minPassScore}.`,
          row: i,
          column: 4,
          from: this.name,
        });
      }
    }

    this.report(localErrors, validMsgs, tableErrors);
  }
}
