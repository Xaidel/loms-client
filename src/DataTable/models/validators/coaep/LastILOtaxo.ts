import { COAEP } from "../../../../types/coaep";
import { CoaepDT } from "../../CoaepDT";
import DataTableException from "../../../types/DataTableException";
import { DTValidator } from "../../DTValidator";

export class LastILOTaxo extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("LAST_ILO_TAXO");
  }

  /**
   * Validate the COAEP object.
   * Checks if the last ILO of every CO has the same taxonomy level as the CO.
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
    const localErrors: DataTableException[] = [];

    if (!coaepObj) {
      tableErrors.push({
        error: "Unable to access COAEP object.",
        from: this.name,
      });
      return;
    }

    for (let i = 0; i < coaepObj.co.length; i++) {
      const co = coaepObj.co[i];

      if (!co) {
        const { row, column } = await coaepDT.findValue(i + 1 + "");
        localErrors.push({
          error: `No CO Statement for CO ${i + 1}.`,
          row,
          column: column + 1,
          from: this.name,
        });

        continue;
      }

      if (!co?.ilo) {
        const { row, column } = await coaepDT.findValue(co.statement);

        localErrors.push({
          error: `No ILOs for CO ${i + 1}.`,
          row,
          column,
          from: this.name,
        });
        continue;
      }

      const lastILOIdx = co.ilo.length - 1;
      const lastILO = co.ilo[lastILOIdx];

      if (!lastILO!.taxonomy_level) {
        const { row, column } = await coaepDT.findValue(lastILO!.statement);

        localErrors.push({
          error: `Last ILO for CO ${i + 1} has no Taxonomy Level.`,
          row,
          column,
          from: this.name,
        });
        continue;
      }

      if (lastILO!.taxonomy_level !== co.taxonomy_level) {
        const { row, column } = await coaepDT.findValue(lastILO!.statement);

        localErrors.push({
          error: `Last ILO for CO ${i + 1} does not match the CO's Taxonomy Level. (${lastILO!.taxonomy_level} !== ${co.taxonomy_level})`,
          row,
          column,
          from: this.name,
        });
      }
    }

    this.report(localErrors, validMsgs, tableErrors);
  }
}

export default LastILOTaxo;
