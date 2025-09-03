export type TransmutedScore = Record<string, number>
export type Coaep = Record<string, { transmuted_score: TransmutedScore }>

export type Student = {
  student_name: string
  coaep: Coaep
}

export type ClassAssignment = {
  faculty: string
  course: string
  section: string
  semester: number
  sy: number
}

export type TotalIlo = {
  achievedMinimum: number
  average: number
}
export type Total = Record<string, Record<string, TotalIlo>>

export type AssessmentData = {
  classAssignment: ClassAssignment
  student: Student[]
  total: Total
}
