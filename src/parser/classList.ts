import Papa from "papaparse"
import { classList } from "../types/classList"

export function parseClassList(csvData: string): classList[] {
    let curr_id: string = ""
    let course_id: string = ""
    let subj_code: string = ""
    let faculty: string = ""

    const cleanRows: classList[] = []

    Papa.parse<string[]>(csvData, {
        skipEmptyLines: true,
        complete: (result) => {
            result.data.forEach((row) => {
                const cells = row.map((c) => (c ?? "").toString().trim())
                const firstCell = cells[0] ?? ""

                if (firstCell.startsWith("Course No:")) {
                    // "Course No: 3093 BIT324L-OBa"
                    const courseLine = firstCell.replace("Course No:", "").trim()
                    const parts = courseLine.split(/\s+/)

                    subj_code = parts[0] ?? "" // 3093
                    // BIT999L-OBa split by "-"
                    const [course, section] = (parts[1] ?? "").split("-")
                    course_id = course ?? "" // BIT999L

                    // OB from OBa (remove last character if it's a letter section)
                    curr_id = (section ?? "").replace(/[a-zA-Z]$/, "")
                }

                // Extract faculty
                if (firstCell.startsWith("Teacher:")) {
                    faculty = firstCell.replace("Teacher:", "").trim()
                }

                // Extract student rows
                if (/^\d+$/.test(firstCell)) {
                    const dept_id: string = cells[1] ?? ""
                    const student_no: string = cells[2] ?? ""

                    cleanRows.push({
                        curr_id,
                        subj_code,
                        course_id,
                        faculty,
                        dept_id,
                        student_no,
                    })
                }
            })
        },
    })

    return cleanRows
}
