// Define keywords to look for in the header row
const HEADERS = {
  co: ["course outcome", "co statement", "outcome statement"],
  ilo: ["intended learning", "ilo", "learning outcome"],
  assessTool: ["assessment tool", "assessment method", "tool"],
  perfTarget: ["performance target", "target", "passing"],
};

export default function getCoaepHeader(rows: string[][]) {
  // Default indices (fallback)
  let indices = {
    headerRowIndex: -1,
    coIdx: -1,
    iloIdx: -1,
    assessToolIdx: -1,
    perfTargetIdx: -1,
  };

  // Scan the first 20 rows (headers usually aren't lower than this)
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = (rows[r] ?? []).map((cell) => cell.toLowerCase().trim());

    // Check if this row matches our keywords
    const co = row.findIndex((c) => HEADERS.co.some((k) => c.includes(k)));
    const ilo = row.findIndex((c) => HEADERS.ilo.some((k) => c.includes(k)));
    const tool = row.findIndex((c) =>
      HEADERS.assessTool.some((k) => c.includes(k))
    );
    const target = row.findIndex((c) =>
      HEADERS.perfTarget.some((k) => c.includes(k))
    );

    // Scoring: valid if we find at least 3 of the 4 headers in this row
    const matches = [co, ilo, tool, target].filter((i) => i !== -1).length;

    if (matches >= 3) {
      indices = {
        headerRowIndex: r,
        coIdx: co,
        iloIdx: ilo,
        assessToolIdx: tool,
        perfTargetIdx: target,
      };
      break; // Stop once we find the header row
    }
  }

  return indices;
}
