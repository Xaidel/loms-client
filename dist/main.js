import { uploadCurriculum } from "./relay/curriculum";
export default class Client {
    BASE_URL;
    constructor(url) {
        this.BASE_URL = url;
    }
    Parser() {
        return {
            /*
             * Parse the official curriculum data from the registrar to a digestible format
             * @param curriculum file from registrar
             * @ returns status 201
             * */
            curriculum: async (csv) => {
                const res = await uploadCurriculum(this.BASE_URL, csv);
                return res;
            }
        };
    }
}
