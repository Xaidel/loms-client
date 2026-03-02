import Taxonomy from "../../types/Taxonomy";

/**
 * Represents the Program Outcome column in the internal POAEP DataTable.
 */
export type PoaepDT_PO = string | null;

// export type PoaepDT_Taxo = Taxonomy | null;
// export type PoaepDT_PI = string | null;

/**
 * Represents the Performance Indicator column in the internal POAEP DataTable.
 */
export type PoaepDT_PI = [PoaepDT_Taxo, PoaepDT_Verb, PoaepDT_Rest] | null;

export type PoaepDT_Taxo = Taxonomy | null;
export type PoaepDT_Verb = string | null;
export type PoaepDT_Rest = string | null;

/**
 * Represents the Formative Course column in the internal POAEP DataTable.
 */
export type PoaepDT_FC = string | null;

/**
 * Represents the Summative Course column in the internal POAEP DataTable.
 */
export type PoaepDT_SC = string | null;

/**
 * Represents the Assessment Tool column in the internal POAEP DataTable.
 */
export type PoaepDT_AT = string | null;

/**
 * Represents the Performance Target column in the internal POAEP DataTable.
 */
export type PoaepDT_Perf = number | null;
/**
 * Represents the Passing Score column in the internal POAEP DataTable.
 */
export type PoaepDT_Pass = number | null;

/**
 * Represents the Performance Target and Passing Score tuple column in the internal POAEP DataTable.
 */
export type PoaepDT_PT = [PoaepDT_Perf, PoaepDT_Pass];

// export type PoaepRow = [
//   PoaepDT_PO,
//   PoaepDT_Taxo,
//   PoaepDT_PI,
//   PoaepDT_FC[],
//   PoaepDT_SC,
//   PoaepDT_AT,
//   PoaepDT_PT,
//];

export type PoaepRow = [
  PoaepDT_PO,
  PoaepDT_PI,
  PoaepDT_FC[],
  PoaepDT_SC,
  PoaepDT_AT,
  PoaepDT_PT,
];
