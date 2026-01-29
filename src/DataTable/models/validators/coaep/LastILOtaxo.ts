import { COAEP } from "../../../../types/coaep";
import { CoaepDT } from "../../CoaepDT";
import DataTableException from "../../../types/DataTableException";
import { DTValidator } from "../../DTValidator";

// const dteFrom = "LAST_ILO_TAXO";

// /**
//  * Validates if the last ILO Taxonomy Level matches the CO Taxonomy Level.
//  *
//  * @param validMsgs
//  * @param tableErrors
//  * @param coaepDT
//  * @param coaepObj
//  * @returns
//  */
// export const validateLastILOTaxo = async (
//   validMsgs: string[],
//   tableErrors: DataTableException[],
//   coaepDT: CoaepDT,
//   coaepObj: COAEP | null,
// ) => {
//   if (!coaepObj) {
//     tableErrors.push({
//       error: "Unable to access COAEP object.",
//       from: dteFrom,
//     });
//     return;
//   }

//   for (let i = 0; i < coaepObj.co.length; i++) {
//     const co = coaepObj.co[i];

//     if (!co) {
//       tableErrors.push({
//         error: `No CO Statement for CO ${i + 1}.`,
//         from: dteFrom,
//       });

//       continue;
//     }

//     if (!co?.ilo) {
//       const { row, column } = await coaepDT.findValue(co.statement);

//       tableErrors.push({
//         error: `No ILO for CO ${i + 1}.`,
//         from: dteFrom,
//       });
//       continue;
//     }

//     const lastILOIdx = co.ilo.length - 1;
//     const lastILO = co.ilo[lastILOIdx];

//     if (!lastILO!.taxonomy_level) {
//       tableErrors.push({
//         error: `Last ILO for CO ${i + 1} has no Taxonomy Level.`,
//         from: dteFrom,
//       });
//       continue;
//     }

//     if (lastILO!.taxonomy_level !== co.taxonomy_level) {
//       tableErrors.push({
//         error: `Last ILO for CO ${i + 1} does not match CO Taxonomy Level.`,
//         from: dteFrom,
//       });
//     }
//   }
// };

export class LastILOTaxo extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("LAST_ILO_TAXO");
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

    for (let i = 0; i < coaepObj.co.length; i++) {
      const co = coaepObj.co[i];

      if (!co) {
        localErrors.push({
          error: `No CO Statement for CO ${i + 1}.`,
          from: this.name,
        });

        continue;
      }

      if (!co?.ilo) {
        const { row, column } = await coaepDT.findValue(co.statement);

        localErrors.push({
          error: `No ILO for CO ${i + 1}.`,
          from: this.name,
        });
        continue;
      }

      const lastILOIdx = co.ilo.length - 1;
      const lastILO = co.ilo[lastILOIdx];

      if (!lastILO!.taxonomy_level) {
        localErrors.push({
          error: `Last ILO for CO ${i + 1} has no Taxonomy Level.`,
          from: this.name,
        });
        continue;
      }

      if (lastILO!.taxonomy_level !== co.taxonomy_level) {
        localErrors.push({
          error: `Last ILO for CO ${i + 1} does not match CO Taxonomy Level.`,
          from: this.name,
        });
      }
    }

    if (localErrors.length > 0) tableErrors.push(...localErrors);
    else validMsgs.push(`${this.name} successfully validated.`);
  }
}
