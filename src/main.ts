import uploadCurriculum from "./relay/curriculum"

export default class Client {
  private BASE_URL: string

  constructor(url: string) {
    this.BASE_URL = url
  }

  Parser() {
    return {
      /*
       * Parse the official curriculum data from the registrar to a digestible format
       * @param curriculum file from registrar
       * @ returns status 201
       * */
      curriculum: async (csv: File): Promise<Record<string, unknown>> => {
        const res = await uploadCurriculum(this.BASE_URL, csv)
        return res
      }
    }
  }


}
