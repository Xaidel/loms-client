"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importDefault(require("./main"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client = new main_1.default('http://localhost:3000/api/v1');
const filePath = path_1.default.join(__dirname, "../KR.xls");
const buffer = fs_1.default.readFileSync(filePath);
const file = new File([buffer], 'KR.xls', { type: 'text/xls' });
console.log(client.Parser().curriculum(file));
