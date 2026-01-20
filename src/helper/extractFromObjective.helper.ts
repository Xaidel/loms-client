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

  const regex = /(?:\(([IED])\))?\s*(\w+)\s*:\s*(\w+)/;
  const match = objective.match(regex);

  if (match) {
    // Cognitive Level: (I)/(E)/(D)
    if (match[1]) result.cognitive_level = match[1] as "I" | "E" | "D";

    // Taxonomy Level: word before colon
    if (match[2]) result.taxonomy_level = match[2].toLowerCase();

    // Verb: word after colon
    if (match[3]) result.verb = match[3].toLowerCase();
  }

  return result;
}

// const sampleObj =
//   "(I) REMEMBERING: Identify the fundamental web concepts, including how the web works, web History, and the purpose of web technologies.";

// console.log(extractFromObjective(sampleObj));
