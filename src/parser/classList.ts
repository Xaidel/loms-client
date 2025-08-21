import Papa from "papaparse"
import { classList } from "../types/classList"

export function parseClassList(csvData: string): classList[] {
    const rows: string[][] = Papa.parse<string[]>(csvData, {
        skipEmptyLines: true,
    }).data as string[][]

    let section: string = ""
    let course_id: string = ""
    let subj_code: string = ""

    const enrolledCourses: classList[] = []

    rows.forEach((row) => {
        const cells = row.map((c) => (c ?? "").toString().trim())
        const firstCell = cells[0] ?? ""

        if (firstCell.startsWith("Course No:")) {
            // "Course No: 3093 BIT324L-OBa"
            const courseLine = firstCell.replace("Course No:", "").trim()
            const parts = courseLine.split(/\s+/)

            subj_code = parts[0] ?? "" // 3093
            const [course, sec] = (parts[1] ?? "").split("-")
            course_id = course ?? ""   // BIT999L

            const sectionMatch = (sec ?? "").match(/[a-z]$/)
            section = sectionMatch ? sectionMatch[0] : ""
        }

        if (/^\d+$/.test(firstCell)) {
            const student_no: string = cells[2] ?? ""

            enrolledCourses.push({
                subj_code,
                student_no,
                course_id,
                section,
            })
        }
    })

    return enrolledCourses
}