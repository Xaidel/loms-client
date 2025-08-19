import { uploadCurriculum } from "./relay/uploadCurriculum"
import { uploadCourseOffering } from "./relay/uploadCourseOffering"
import { uploadCOAEP } from "./relay/uploadCOAEP"
import { uploadEnrolledStudent } from "./relay/uploadEnrolledStudent"
import { uploadClassList } from "./relay/uploadClassList"

export default class Client {
  private BASE_URL: string

  constructor(url: string) {
    this.BASE_URL = url
  }

  Parser() {
    return {
      /**
       * Parse the official curriculum data from the registrar to a digestible format
       * @param curriculum file from registrar
       * @returns status 201
       */
      curriculum: async (xls: File): Promise<Record<string, unknown>> => {
        const res = await uploadCurriculum(this.BASE_URL, xls)
        return res
      },

      /**
       * Parse the course offering data
       * @param offering file from registrar
       * @returns status 201
       */
      courseOffering: async (xls: File): Promise<Record<string, unknown>> => {
        const res = await uploadCourseOffering(this.BASE_URL, xls)
        return res
      },

      coaep: async (xls: File) => {
        const res = await uploadCOAEP(this.BASE_URL, xls)
        return res
      },

      enrolledStudent: async (xls: File) => {
        const res = await uploadEnrolledStudent(this.BASE_URL, xls)
        return res
      },

      classlist: async (xls: File) => {
        const res = await uploadClassList(this.BASE_URL, xls)
        return res
      },
    }
  }
}
