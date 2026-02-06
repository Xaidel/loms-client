import Taxonomy from "../types/Taxonomy";

export default function extractFromObjective(objective: string): {
  cognitive_level: "I" | "E" | "D" | null;
  taxonomy_level: Taxonomy | null;
  verb: string | null;
  rest: string | null;
} {
  const result = {
    cognitive_level: null as "I" | "E" | "D" | null,
    taxonomy_level: null as Taxonomy | null,
    verb: null as string | null,
    rest: objective.trim() as string | null,
  };

  // Extract cognitive level from rest if existing
  const cognitiveLevelMatch = objective.match(/^\((I|E|D)\)/);
  if (cognitiveLevelMatch) {
    result.cognitive_level = cognitiveLevelMatch[1] as "I" | "E" | "D";
    result.rest = objective.slice(cognitiveLevelMatch[0].length).trim();
  }

  // Extract taxonomy level as the word before colon, else no taxonomy level
  const taxonomyLevelMatch = result.rest?.match(/^(.*?)\:/);
  if (taxonomyLevelMatch) {
    result.taxonomy_level =
      (taxonomyLevelMatch[1]!.trim().toLowerCase() as Taxonomy) || null;
    result.rest =
      result.rest?.slice(taxonomyLevelMatch[0].length).trim() || null;
  }

  // Extract verb from rest as word following the keywords shall/will
  const verbMatch = result.rest?.match(/(?:shall|will)\s+([a-zA-Z-]+)/);

  if (verbMatch) {
    result.verb = verbMatch[1]!.trim().toLowerCase() || null;
  }

  // Else pick first word
  else {
    const firstWordMatch = result.rest?.match(/^\w+/);
    if (firstWordMatch)
      result.verb = firstWordMatch[0]!.trim().toLowerCase() || null;
  }

  return result;
}

const sampleObj =
  "(I) REMEMBERING: Identify the fundamental web concepts, including how the web works, web History, and the purpose of web technologies.";

// console.log(extractFromObjective(sampleObj));
