"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const curriculum_1 = __importDefault(require("./relay/curriculum"));
class Client {
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
                const res = await (0, curriculum_1.default)(this.BASE_URL, csv);
                return res;
            }
        };
    }
}
exports.default = Client;
