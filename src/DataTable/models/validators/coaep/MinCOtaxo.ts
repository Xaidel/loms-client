import { COAEP } from "../../../../types/coaep";
import { CoaepDT } from "../../CoaepDT";
import DataTableException from "../../../types/DataTableException";
import { DTValidator } from "../../DTValidator";

const invalidTaxos = ["remembering", "understanding"];

export class MinCOtaxo extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("MIN_CO_TAXO");
  }

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

    for (const co of coaepObj.co) {
      if (!co.taxonomy_level) {
        localErrors.push({
          error: `No taxonomy level for CO Statement: ${co.statement}`,
          from: this.name,
        });
        continue;
      }

      for (const invalidTaxo of invalidTaxos) {
        if (co.taxonomy_level === invalidTaxo) {
          const { row, column } = await coaepDT.findValue(co.statement);

          let tbe = {
            error: `Cannot have CO Taxonomy Level of lower than Applying: ${co.taxonomy_level.toUpperCase()}`,
            from: this.name,
          } as DataTableException;

          if (row !== -1 || column !== -1) {
            tbe = {
              ...tbe,
              row,
              column,
            } as DataTableException;
          }

          localErrors.push(tbe);
        }
      }
    }

    if (localErrors.length > 0) tableErrors.push(...localErrors);
    else validMsgs.push(`${this.name} successfully validated.`);
    return;
  }
}
