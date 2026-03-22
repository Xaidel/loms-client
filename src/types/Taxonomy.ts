export type Taxonomy =
  | "remembering"
  | "understanding"
  | "applying"
  | "analyzing"
  | "evaluating"
  | "creating";

// Hardcoded Order of taxonomy levels
export const taxoOrder: Record<Taxonomy, number> = {
  remembering: 1,
  understanding: 2,
  applying: 3,
  analyzing: 4,
  evaluating: 5,
  creating: 6,
} as const;

export const Taxonomies: Taxonomy[] = [
  "remembering",
  "understanding",
  "applying",
  "analyzing",
  "evaluating",
  "creating",
] as const;

export default Taxonomy;
