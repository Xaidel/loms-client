import { COAEP } from "../../../../types/coaep";
import { CoaepDT } from "../../CoaepDT";
import DataTableException from "../../../types/DataTableException";
import { DTValidator } from "../../DTValidator";
import Taxonomy from "../../../../types/Taxonomy";
import { CoaepRow } from "../../../types/CoaepDTRow";

const whitelist: Taxonomy[] = [
  "applying",
  "analyzing",
  "evaluating",
  "creating",
];

const blacklist: Taxonomy[] = ["remembering", "understanding"];

export class MinCOtaxo extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("MIN_CO_TAXO");
  }

  /**
   * Validate the COAEP object.
   * Checks if every Course Outcome has a taxonomy level of "Applying" or higher.
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
      const co = coaepObj.co[i]!;

      const taxo = co.taxonomy_level?.trim()?.toLowerCase() as Taxonomy;

      if (!taxo) {
        localErrors.push({
          error: `No taxonomy level for CO ${i + 1}`,
          from: this.name,
        });
        continue;
      }

      if (blacklist.includes(taxo)) {
        const { row, column } = (await coaepDT.searchTable(co.statement))[0]!;
        if (row) {
          localErrors.push({
            error: `Cannot have CO Taxonomy Level of lower than APPLYING: ${taxo.toUpperCase()}`,
            row,
            column,
            from: this.name,
          });
        }
      }

      if (!whitelist.includes(taxo)) {
        const { row, column } = (await coaepDT.searchTable(co.statement))[0]!;
        if (row) {
          localErrors.push({
            error: `Invalid Taxonomy Level: ${taxo.toUpperCase()}`,
            row,
            column,
            from: this.name,
          });
        }
      }
    }

    this.report(localErrors, validMsgs, tableErrors);
    return;
  }
}
