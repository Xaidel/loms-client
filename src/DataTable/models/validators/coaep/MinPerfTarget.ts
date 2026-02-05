import { COAEP } from "../../../../types/coaep";
import DataTableException from "../../../types/DataTableException";
import { CoaepDT } from "../../CoaepDT";
import { DTValidator } from "../../DTValidator";

const minPerfTarget = 50;
const minPassScore = 50;

export class MinPerfTarget extends DTValidator<CoaepDT, COAEP> {
  constructor() {
    super("MIN_PERF_TARGET");
  }

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
        error: "Failed to access table data.",
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
          error: "Pass score is required.",
          row: i,
          column: 6,
          from: this.name,
        });
      else if (passScore < minPassScore) {
        localErrors.push({
          error: `Pass score must be at least ${minPassScore}.`,
          row: i,
          column: 6,
          from: this.name,
        });
      }
    }

    this.report(localErrors, validMsgs, tableErrors);
  }
}
