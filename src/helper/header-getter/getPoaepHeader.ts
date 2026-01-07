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
    headerRowIndex: -1,
    poIdx: -1,
    tlIdx: -1,
    piIdx: -1,
    fcIdx: -1,
    scIdx: -1,
    atIdx: -1,
    ptIdx: -1,
  };

  // Scan the first 20 rows (headers usually aren't lower than this)
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = (rows[r] ?? []).map((cell) => cell.toLowerCase().trim());

    // Check if this row matches our keywords
    const po = row.findIndex((c) => HEADERS.po.some((k) => c.includes(k)));
    const tl = row.findIndex((c) => HEADERS.tl.some((k) => c.includes(k)));
    const pi = row.findIndex((c) => HEADERS.pi.some((k) => c.includes(k)));
    const fc = row.findIndex((c) => HEADERS.fc.some((k) => c.includes(k)));
    const sc = row.findIndex((c) => HEADERS.sc.some((k) => c.includes(k)));
    const at = row.findIndex((c) => HEADERS.at.some((k) => c.includes(k)));
    const pt = row.findIndex((c) => HEADERS.pt.some((k) => c.includes(k)));

    // Scoring: valid if we find at least 3 of the 4 headers in this row
    const matches = [po, tl, pi, fc, sc, at, pt].filter((i) => i !== -1).length;

    if (matches >= 3) {
      indices = {
        headerRowIndex: r,
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

  return indices;
}
