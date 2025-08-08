export default class Client {
    private BASE_URL;
    constructor(url: string);
    Parser(): {
        curriculum: (csv: File) => Promise<Record<string, unknown>>;
    };
}
