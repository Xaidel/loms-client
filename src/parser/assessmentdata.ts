import Papa from "papaparse"
import {
  AssessmentData,
  ClassAssignment,
  Coaep,
  Student,
  Total,
  TransmutedScore
} from "../types/assessmentdata"

export function parseAssessmentCsv(csv: string): { assessmentData: AssessmentData } {
  const { data } = Papa.parse<string[]>(csv, { skipEmptyLines: true })
  const rows = (data as string[][]).filter(r => r.length > 0)

  function extractValueAfterLabel(row: string[], label: string): string | undefined {
    const index = row.findIndex(cell => cell?.trim() === label)
    return index !== -1 ? row[index + 2]?.trim().replace(/"/g, "") : undefined
  }

  //metadata
  const courseSection = extractValueAfterLabel(rows.find(r => r.includes("Course & Sec")) || [], "Course & Sec") || ""
  const faculty = extractValueAfterLabel(rows.find(r => r.includes("Faculty")) || [], "Faculty") || ""
  const semesterStr = extractValueAfterLabel(rows.find(r => r.includes("Semester")) || [], "Semester")
  const semester = semesterStr?.toLowerCase().includes("1st") ? 1 : semesterStr?.toLowerCase().includes("2nd") ? 2 : 0

  const syStr: string = extractValueAfterLabel(rows.find(r => r.includes("School Year")) || [], "School Year") || ""
  const sy = syStr.includes("-") ? parseInt(syStr.split("-")[0]!) : 0

  const course = courseSection.split(/\s+/)[0] || ""
  const section = course ? course.charAt(course.length - 1) : ""

  const classAssignment: ClassAssignment = {
    faculty,
    course: course,
    section: section,
    semester: semester,
    sy
  }

  const coRowIndex = rows.findIndex(r => r.some(c => c?.trim() === "CO #"))
  if (coRowIndex === -1) {
    throw new Error("CO header row not found in CSV")
  }

  const iloRow = rows[coRowIndex + 1]
  if (!iloRow) {
    throw new Error("ILO header row not found in CSV")
  }

  const iloGroups: Record<string, string[]> = {}
  let coCounter = 1
  let iloCounter = 1

  for (let i = 3; i < iloRow.length; i++) {
    const val = iloRow[i]
    if (!val) continue
    const coKey = `co${coCounter}`
    if (!iloGroups[coKey]) iloGroups[coKey] = []
    iloGroups[coKey].push(`ilo${iloCounter}`)
    iloCounter++
    if (iloCounter > 3) {
      coCounter++
      iloCounter = 1
    }
  }

  const studentHeaderIndex = rows.findIndex(r => r.includes("Name of Students"))
  if (studentHeaderIndex === -1) {
    throw new Error("Student header row not found in CSV")
  }

  const headerRow = rows[studentHeaderIndex]
  if (!headerRow) {
    throw new Error("Student header row is missing")
  }

  const nameColIndex = headerRow.findIndex(c => c?.includes("Name of Students"))
  if (nameColIndex === -1) {
    throw new Error("Name of Students column not found in CSV")
  }

  const firstScoreColIndex = nameColIndex + 2

  const students: Student[] = []
  for (let i = studentHeaderIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue

    if (row.some(c =>
      c?.toUpperCase().includes("TOTAL STUDENTS") ||
      c?.toUpperCase().includes("ACHIEVED THE MINIMUM") ||
      c?.toUpperCase().includes("INACTIVE") ||
      c?.toUpperCase().includes("AVERAGE")
    )) {
      continue
    }

    if (!row[nameColIndex]) continue

    const name = row[nameColIndex].replace(/"/g, "").trim()
    const scores = row.slice(firstScoreColIndex).map(s =>
      s && !isNaN(Number(s)) ? parseFloat(s) : 0
    )

    let scoreIndex = 0
    const coaep: Coaep = {}
    Object.entries(iloGroups).forEach(([coKey, iloKeys]) => {
      const transmuted: TransmutedScore = {}
      iloKeys.forEach(iloKey => {
        transmuted[iloKey] = scores[scoreIndex] ?? 0
        scoreIndex++
      })
      coaep[coKey] = { transmuted_score: transmuted }
    })

    students.push({ student_name: name, coaep })
  }

  const achievedRow = rows.find(r => r.some(c => c?.includes("ACHIEVED THE MINIMUM")))
  const avgRow = rows.find(r => r.some(c => c?.includes("AVERAGE")))

  const achieved = achievedRow
    ? achievedRow.slice(firstScoreColIndex).map(s =>
      s && !isNaN(Number(s)) ? parseInt(s) : 0
    )
    : []

  const averages = avgRow
    ? avgRow.slice(firstScoreColIndex).map(s =>
      s && s !== "#DIV/0!" && !isNaN(Number(s)) ? parseInt(s) : 0
    )
    : []

  const total: Total = {}
  let totalIndex = 0
  Object.entries(iloGroups).forEach(([coKey, iloKeys]) => {
    if (!total[coKey]) total[coKey] = {}
    iloKeys.forEach(iloKey => {
      total[coKey]![iloKey] = {
        achievedMinimum: achieved[totalIndex] ?? 0,
        average: averages[totalIndex] ?? 0
      }
      totalIndex++
    })
  })

  return {
    assessmentData: {
      classAssignment,
      student: students,
      total
    }
  }
}