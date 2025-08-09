export default class Client {
    private BASE_URL;
    constructor(url: string);
    Parser(): {
        /**
         * Parse the official curriculum data from the registrar to a digestible format
         * @param curriculum file from registrar
         * @returns status 201
         */
        curriculum: (csv: File) => Promise<Record<string, unknown>>;
        /**
         * Parse the course offering data
         * @param offering file from registrar
         * @returns status 201
         */
        courseOffering: (csv: File) => Promise<Record<string, unknown>>;
    };
}
