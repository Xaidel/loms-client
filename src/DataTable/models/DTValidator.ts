import DataTableException from "../types/DataTableException";

export abstract class DTValidator<DT, OBJ> {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  abstract validate(
    validMsgs: string[],
    tableErrors: DataTableException[],
    dataTable: DT,
    jsonObj: OBJ,
  ): Promise<void>;
}
