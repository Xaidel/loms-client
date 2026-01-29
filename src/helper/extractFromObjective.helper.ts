export default function extractFromObjective(objective: string): {
  cognitive_level: "I" | "E" | "D" | null;
  taxonomy_level: string | null;
  verb: string | null;
} {
  const result = {
    cognitive_level: null as "I" | "E" | "D" | null,
    taxonomy_level: null as string | null,
    verb: null as string | null,
  };

  // Extract Cognitive Level and Taxonomy Level then text after the colon
  const mainRegex = /(?:\(([IED])\))?\s*(\w+)\s*:\s*(.*)/i;
  const match = objective.match(mainRegex);

  if (match) {
    // Cognitive Level: (I)/(E)/(D)
    if (match[1]) result.cognitive_level = match[1] as "I" | "E" | "D";

    // Taxonomy Level: word before colon
    if (match[2]) result.taxonomy_level = match[2].toLowerCase();

    // The rest of the string
    const afterColon = match[3]?.trim();

    if (afterColon) {
      // Look for "has" or "will" followed by the verb
      const verbRegex = /(?:shall|will)\s+(\w+)/i;
      const verbMatch = afterColon.match(verbRegex);

      if (verbMatch) {
        // Take the word right after has/will
        result.verb = verbMatch[1]!.toLowerCase();
      } else {
        // Else take the first word after the colon
        result.verb = afterColon.split(/\s+/)[0]!.toLowerCase();
      }
    }
  }

  return result;
}
// const sampleObj =
//   "(I) REMEMBERING: Identify the fundamental web concepts, including how the web works, web History, and the purpose of web technologies.";

// console.log(extractFromObjective(sampleObj));
