import { uploadCurriculum } from "./relay/uploadCurriculum";
import { uploadCourseOffering } from "./relay/uploadCourseOffering";
export default class Client {
    BASE_URL;
    constructor(url) {
        this.BASE_URL = url;
    }
    Parser() {
        return {
            /**
             * Parse the official curriculum data from the registrar to a digestible format
             * @param curriculum file from registrar
             * @returns status 201
             */
            curriculum: async (csv) => {
                const res = await uploadCurriculum(this.BASE_URL, csv);
                return res;
            },
            /**
             * Parse the course offering data
             * @param offering file from registrar
             * @returns status 201
             */
            courseOffering: async (csv) => {
                const res = await uploadCourseOffering(this.BASE_URL, csv);
                return res;
            }
        };
    }
}
