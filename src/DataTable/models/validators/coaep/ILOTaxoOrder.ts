import { COAEP } from "../../../../types/coaep";
import DataTableException from "../../../types/DataTableException";
import { CoaepDT } from "../../CoaepDT";
import { DTValidator } from "../../DTValidator";

// Hardcoded Order of taxonomy levels
const taxoOrder: Record<string, number> = {
  remembering: 1,
  understanding: 2,
  applying: 3,
  analyzing: 4,
  evaluating: 5,
  creating: 6,
};

export class ILOTaxoOrder extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("ILO_TAXO_ORDER");
  }

  /**
   * Validate the COAEP object.
   * Checks if every Course Outcome has its ILOs in order of taxonomy level.
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

      const firstIloAt: {
        row: number;
        column: number;
      } = await coaepDT.findValue(co.ilo[0]!.statement);
      const iloOrder = co.ilo.map((ilo) => taxoOrder[ilo.taxonomy_level!]);

      let lastValid = iloOrder[0];
      for (let j = 1; j < iloOrder.length; j++) {
        if (iloOrder[j]! < lastValid!) {
          localErrors.push({
            error: `Under CO ${i + 1}, ILO ${j + 1} should not have a taxonomy level lower than ILO ${j}'s.`,
            row: firstIloAt.row,
            column: firstIloAt.column + j,
            from: this.name,
          });
          continue;
        }
        lastValid = iloOrder[j];
      }
    }

    this.report(localErrors, validMsgs, tableErrors);
  }
}

export default ILOTaxoOrder;
