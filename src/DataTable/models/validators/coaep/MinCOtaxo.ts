import { CO, COAEP } from "../../../../types/coaep";
import { CoaepDT } from "../../CoaepDT";
import DataTableException from "../../../types/DataTableException";

const dteFrom = "MIN_CO_TAXO";

const invalidTaxos = ["remembering", "understanding"];

/**
 * Validates if the CO Taxonomy Levels are at least "Analyzing".
 *
 * @param validMsgs
 * @param tableErrors
 * @param coaepDT
 * @param coaepObj
 * @returns
 */
export const validateMinCOtaxo = async (
  validMsgs: string[],
  tableErrors: DataTableException[],
  coaepDT: CoaepDT,
  coaepObj: COAEP | null,
) => {
  if (!coaepObj) {
    tableErrors.push({
      error: "Unable to access COAEP object.",
      from: dteFrom,
    });
    return;
  }

  for (const co of coaepObj.co) {
    if (!co.taxonomy_level) {
      tableErrors.push({
        error: `No taxonomy level for CO Statement: ${co.statement}`,
        from: dteFrom,
      });
      continue;
    }

    for (const invalidTaxo of invalidTaxos) {
      if (co.taxonomy_level === invalidTaxo) {
        const { row, column } = await coaepDT.findValue(co.statement);

        let tbe = {
          error: `Cannot have CO Taxonomy Level of lower than Applying: ${co.taxonomy_level.toUpperCase()}`,
          from: dteFrom,
        } as DataTableException;

        if (row !== -1 || column !== -1) {
          tbe = {
            ...tbe,
            row,
            column,
          } as DataTableException;
        }

        tableErrors.push(tbe);
      }
    }
  }

  validMsgs.push("Successfully validated minimum CO Taxonomy Level.");
  Promise.resolve();
};

export default validateMinCOtaxo;
