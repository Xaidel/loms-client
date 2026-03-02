import DataTableException from "../../../types/DataTableException";
import { DTValidator } from "../../DTValidator";
import Taxonomy from "../../../../types/Taxonomy";
import { PoaepDT } from "../../PoaepDT";
import { POAEP } from "../../../../types/poaep";
import { PoaepDT_PT } from "../../../types/PoaepDTRow";

const minPerfTarget = 50;
const minPassScore = 50;

export class MinPIPerfTarget extends DTValidator<PoaepDT, POAEP> {
  constructor() {
    super("MIN_PI_PERF_TARGET");
  }

  /**
   * Validate the POAEP object.
   * Checks if every Performance Indicator has a performance target and pass score of 50 or higher.
   *
   * @param {string[]} validMsgs - Array of valid messages.
   * @param {DataTableException[]} tableErrors - Array of table errors.
   * @param {PoaepDT} poaepDT - POAEP DataTable.
   * @param {POAEP | null} poaepObj - POAEP object.
   * @returns {Promise<void>} - Promise that resolves when validation is complete.
   */
  async validate(
    validMsgs: string[],
    tableErrors: DataTableException[],
    poaepDT: PoaepDT,
    poaepObj: POAEP | null,
  ): Promise<void> {
    const localErrors: DataTableException[] = [];

    const { success, data } = poaepDT.getTable();
    if (!success) {
      tableErrors.push({
        error: "Unable to access POAEP table.",
        from: this.name,
      });
      return;
    }

    const { table } = data!;

    for (let i = 0; i < table.length; i++) {
      const po = table[i]!;

      const [perfTarget, passScore] = po[5];

      if (!perfTarget) {
        localErrors.push({
          error: "Performance target is required.",
          row: i,
          column: 6,
          from: this.name,
        });
      } else if (perfTarget < minPerfTarget) {
        localErrors.push({
          error: `Performance target must be at least ${minPerfTarget}.`,
          row: i,
          column: 6,
          from: this.name,
        });
      }

      if (!passScore) {
        localErrors.push({
          error: "Passing score is required.",
          row: i,
          column: 6,
          from: this.name,
        });
      } else if (passScore < minPassScore) {
        localErrors.push({
          error: `Passing score must be at least ${minPassScore}.`,
          row: i,
          column: 6,
          from: this.name,
        });
      }
    }

    this.report(localErrors, validMsgs, tableErrors);
    return;
  }
}
