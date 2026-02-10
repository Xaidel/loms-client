import Taxonomy from "../../types/Taxonomy";

/**
 * Represents the CO number column in the internal COAEP DataTable.
 */
export type CoaepDT_No = string | null;

/**
 * Represents the CO statement column in the internal COAEP DataTable.
 */
export type CoaepDT_CO =
  | [string | null, string | null, string | null, string | null]
  | null;

export type CoaepDT_CogLvl = "I" | "E" | "D" | null;
export type CoaepDT_TaxLvl = Taxonomy | null;
export type CoaepDT_Verb = string | null;
export type CoaepDT_Rest = string | null;

/**
 * Represents the ILO statement column in the internal COAEP DataTable.
 */
export type CoaepDT_ILO = [
  CoaepDT_CogLvl,
  CoaepDT_TaxLvl,
  CoaepDT_Verb,
  CoaepDT_Rest,
];

/**
 * Represents the Assessment Tool column in the internal COAEP DataTable.
 */
export type CoaepDT_AT = string | null;

/**
 * Represents the Performance Target column in the internal COAEP DataTable.
 */
export type CoaepDT_Perf = number | null;

/**
 * Represents the Passing Score column in the internal COAEP DataTable.
 */
export type CoaepDT_Pass = number | null;

/**
 * Represents the Performance Target and Passing Score tuple column in the internal COAEP DataTable.
 * */
export type CoaepDT_PT = [CoaepDT_Perf, CoaepDT_Pass];

/**
 * Represents a row in the internal COAEP DataTable.
 * @column 0: CO Number: string | null
 * @column 1: CO Statement: [string | null, string | null, string | null, string | null] | null
 * @column 2: ILO Statement: [string | null, string | null, string | null, string | null]
 * @column 3: Assessment Tool: string | null
 * @column 4: Performance Target, Passing Score: [number | null, number | null]
 */
export type CoaepRow = [
  CoaepDT_No,
  CoaepDT_CO,
  CoaepDT_ILO,
  CoaepDT_AT,
  CoaepDT_PT,
];
