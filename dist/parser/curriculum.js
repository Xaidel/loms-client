import Papa from "papaparse";
export function parseCurriculum(csvData) {
    let curr_id = "";
    let program_name = "";
    let revision_no = 0;
    let year_level = null;
    const cleanRows = [];
    Papa.parse(csvData, {
        skipEmptyLines: true,
        complete: (result) => {
            result.data.forEach((row) => {
                const cells = row.map((c) => (c ?? "").toString().trim());
                const firstCell = cells[0] ?? "";
                //Metadata
                if (firstCell.includes("Rev#")) {
                    const metaMatch = firstCell.match(/([A-Z]+)\s*-\s*.*:\s*(.*?)\s+Rev#\s*(\d+)/i);
                    if (metaMatch) {
                        curr_id = metaMatch[1]?.trim() ?? "";
                        program_name = metaMatch[2]?.trim() ?? "";
                        revision_no = parseInt(metaMatch[3] ?? "0", 10);
                    }
                    return;
                }
                //Year level
                if (/FIRST YEAR/i.test(firstCell)) {
                    year_level = 1;
                    return;
                }
                if (/SECOND YEAR/i.test(firstCell)) {
                    year_level = 2;
                    return;
                }
                if (/THIRD YEAR/i.test(firstCell)) {
                    year_level = 3;
                    return;
                }
                if (/FOURTH YEAR/i.test(firstCell)) {
                    year_level = 4;
                    return;
                }
                if (/FIFTH YEAR/i.test(firstCell)) {
                    year_level = 5;
                    return;
                }
                //skip semester header
                if (/First Semester/i.test(firstCell) || /Second Semester/i.test(firstCell) || /Summer/i.test(firstCell)) {
                    return;
                }
                // CSV columns: 
                // First Sem:    0=id, 1=desc, 2=units?, 3=lec, 4=lab
                // Second Sem:   6=id, 7=desc, 8=lec, 9=lab
                // Summer Sem:   12=id, 13=desc, 14=lec, 15=lab
                const semesterBlocks = [
                    { sem: 1, offset: 0 }, // first semester columns start at index 0
                    { sem: 2, offset: 6 }, // second semester columns start at index 6
                    { sem: 3, offset: 12 }, // summer semester columns start at index 12
                ];
                semesterBlocks.forEach(({ sem, offset }) => {
                    const course_id = cells[offset] ?? "";
                    const course_desc = cells[offset + 1] ?? "";
                    const total_units = cells[offset + 2] ?? "";
                    const lec_unit = cells[offset + 3] ?? "";
                    const lab_unit = cells[offset + 4] ?? "";
                    if (course_id && year_level) {
                        cleanRows.push({
                            curr_id,
                            program_name,
                            revision_no,
                            year_level,
                            sem,
                            course_id,
                            course_desc,
                            total_units,
                            lec_unit,
                            lab_unit,
                        });
                    }
                });
            });
        },
    });
    return cleanRows;
}
