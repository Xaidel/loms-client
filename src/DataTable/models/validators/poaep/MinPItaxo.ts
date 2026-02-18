import DataTableException from "../../../types/DataTableException";
import { DTValidator } from "../../DTValidator";
import Taxonomy from "../../../../types/Taxonomy";
import { PoaepDT } from "../../PoaepDT";
import { POAEP } from "../../../../types/poaep";

const whitelist: Taxonomy[] = [
  "applying",
  "analyzing",
  "evaluating",
  "creating",
];

export class MinPItaxo extends DTValidator<PoaepDT, POAEP> {
  constructor() {
    super("MIN_PI_TAXO");
  }

  /**
   * Validate the POAEP object.
   * Checks if every Performance Indicator has a taxonomy level of "Applying" or higher.
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
      const taxo = po[1]?.toLowerCase() as Taxonomy | null;

      if (!taxo) continue;

      if (!whitelist.includes(taxo)) {
        localErrors.push({
          error: `Cannot have PO Taxonomy Level of lower than Applying: ${taxo.toUpperCase()}`,
          row: i,
          column: 1,
          from: this.name,
        });
      }
    }

    this.report(localErrors, validMsgs, tableErrors);
    return;
  }
}
