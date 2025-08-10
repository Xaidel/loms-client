import { uploadCurriculum } from "./relay/uploadCurriculum"
import { uploadCourseOffering } from "./relay/uploadCourseOffering"
import { uploadCOAEP } from "./relay/uploadCOAEP"

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
      curriculum: async (csv: File): Promise<Record<string, unknown>> => {
        const res = await uploadCurriculum(this.BASE_URL, csv)
        return res
      },

      /**
       * Parse the course offering data
       * @param offering file from registrar
       * @returns status 201
       */
      courseOffering: async (csv: File): Promise<Record<string, unknown>> => {
        const res = await uploadCourseOffering(this.BASE_URL, csv)
        return res
      },

      coaep: async (csv: File) => {
        const res = await uploadCOAEP(csv)
        return res
      }
    }
  }
}
