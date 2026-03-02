import Taxonomy from "../../types/Taxonomy";

export type PoaepDT_PO = string | null;
export type PoaepDT_Taxo = Taxonomy | null;
export type PoaepDT_PI = string | null;

export type PoaepDT_FC = string | null;
export type PoaepDT_SC = string | null;

export type PoaepDT_AT = string | null;

export type PoaepDT_Perf = number | null;
export type PoaepDT_Pass = number | null;

export type PoaepDT_PT = [PoaepDT_Perf, PoaepDT_Pass];

export type PoaepRow = [
  PoaepDT_PO,
  PoaepDT_Taxo,
  PoaepDT_PI,
  PoaepDT_FC[],
  PoaepDT_SC,
  PoaepDT_AT,
  PoaepDT_PT,
];

//
