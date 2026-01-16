import { uploadCurriculum } from "./relay/uploadCurriculum";
import { uploadCourseOffering } from "./relay/uploadCourseOffering";
import { uploadCOAEP } from "./relay/uploadCOAEP";
import { uploadEnrolledStudent } from "./relay/uploadEnrolledStudent";
import { uploadClassList } from "./relay/uploadClassList";
import { uploadAssessmentData } from "./relay/uploadAssessmentData";
import { uploadDeptFaculty } from "./relay/uploadDeptFaculty";
import { uploadPOAEP } from "./relay/uploadPOAEP";
import { get } from "@dotenvx/dotenvx";
import getAssessmentData from "./payloads/getAssessmentData";
import getClassList from "./payloads/getClassList";
import { getCOAEP } from "./payloads/getCOAEP";
import getCourseOffering from "./payloads/getCourseOffering";
import getCurriculum from "./payloads/getCurriculum";
import getPOAEP from "./payloads/getPOAEP";

export default class Client {
  private BASE_URL: string;

  constructor(url: string) {
    this.BASE_URL = url;
  }

  Parser() {
    return {
      /**
       * Parse the official curriculum data from the registrar to a digestible format
       * @param curriculum file from registrar
       * @returns status 201
       */
      curriculum: async (xls: File): Promise<Record<string, unknown>> => {
        const res = await uploadCurriculum(this.BASE_URL, xls);
        return res;
      },

      /**
       * Parse the course offering data
       * @param offering file from registrar
       * @returns status 201
       */
      courseOffering: async (xls: File): Promise<Record<string, unknown>> => {
        const res = await uploadCourseOffering(this.BASE_URL, xls);
        return res;
      },

      coaep: async (xls: File, course_id: string) => {
        const res = await uploadCOAEP(this.BASE_URL, xls, course_id);
        return res;
      },

      enrolledStudent: async (xls: File) => {
        const res = await uploadEnrolledStudent(this.BASE_URL, xls);
        return res;
      },

      classlist: async (xls: File, subj_code: number, period_id: number) => {
        const res = await uploadClassList(
          this.BASE_URL,
          xls,
          subj_code,
          period_id
        );
        return res;
      },

      assessmentData: async (xls: File) => {
        const res = await uploadAssessmentData(this.BASE_URL, xls);
        return res;
      },

      deptFaculty: async (xls: File) => {
        const res = await uploadDeptFaculty(this.BASE_URL, xls);
        return res;
      },

      poaep: async (
        xls: File,
        token: string,
        curr_id: string,
        period_id: number
      ) => {
        const res = await uploadPOAEP(
          this.BASE_URL,
          xls,
          token,
          curr_id,
          period_id
        );
        return res;
      },

      /**
       * Functions that parse then return the payload
       * instead of directly calling the backend and returning the response
       */
      getAssessmentData,
      getClassList,
      getCOAEP,
      getCourseOffering,
      getCurriculum,
      getPOAEP,
    };
  }
}
