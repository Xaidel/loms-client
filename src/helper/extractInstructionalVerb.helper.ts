export default function extractInstructionalVerb(
  objective: string
): string | null {
  // 1. Normalize text to lowercase to ensure case-insensitive matching
  const text = objective.trim();

  // 2. Define Regex Pattern
  // Explanation:
  // \b(will|shall)\b       -> Finds "will" or "shall" (whole words)
  // \s+                    -> One or more spaces
  // (?:be\s+able\s+to\s+)? -> Non-capturing group for optional "be able to"
  // ([a-zA-Z]+)            -> Captures the actual verb (the next word)
  const pattern = /\b(will|shall)\b\s+(?:be\s+able\s+to\s+)?([a-zA-Z]+)/i;

  // 3. Execute Match
  const match = text.match(pattern);

  // 4. Return the captured verb (group 2) or null if not found
  return match && match[2] !== undefined ? match[2] : null;
}
