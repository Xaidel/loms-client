// Define keywords to look for in the header row
const HEADERS = {
  po: ["program outcome", "po statement", "outcome statement"],
  tl: ["taxonomy", "level"],
  pi: ["performance indicator"],
  fc: ["formative"],
  sc: ["summative"],
  at: ["assessment tool", "assessment method", "tool"],
  pt: ["performance target", "target", "passing"],
};

export default function getPoaepHeader(rows: string[][]) {
  // Default indices (fallback)
  let indices = {
    headerIdx: -1,
    poIdx: -1,
    tlIdx: -1,
    piIdx: -1,
    fcIdx: -1,
    scIdx: -1,
    atIdx: -1,
    ptIdx: -1,
  };

  // Scan the first 20 rows (headers usually aren't lower than this)
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = (rows[i] ?? []).map((cell) => cell.toLowerCase().trim());

    // Check if this row matches our keywords
    const po = row.findIndex((c) =>
      HEADERS.po.some((k) => c.toLowerCase().includes(k))
    );
    const tl = row.findIndex((c) =>
      HEADERS.tl.some((k) => c.toLowerCase().includes(k))
    );
    const pi = row.findIndex((c) =>
      HEADERS.pi.some((k) => c.toLowerCase().includes(k))
    );
    const fc = row.findIndex((c) =>
      HEADERS.fc.some((k) => c.toLowerCase().includes(k))
    );
    const sc = row.findIndex((c) =>
      HEADERS.sc.some((k) => c.toLowerCase().includes(k))
    );
    const at = row.findIndex((c) =>
      HEADERS.at.some((k) => c.toLowerCase().includes(k))
    );
    const pt = row.findIndex((c) =>
      HEADERS.pt.some((k) => c.toLowerCase().includes(k))
    );

    // Scoring: valid if we find  at least 3 headers in this row
    const matches = [po, tl, pi, fc, sc, at, pt].filter((i) => i !== -1).length;

    if (matches >= 3) {
      indices = {
        headerIdx: i,
        poIdx: po,
        tlIdx: tl,
        piIdx: pi,
        fcIdx: fc,
        scIdx: sc,
        atIdx: at,
        ptIdx: pt,
      };
      break;
    }
  }

  if (indices.headerIdx === -1) {
    throw new Error("No valid headers found in POAEP file.");
  }

  return indices;
}
