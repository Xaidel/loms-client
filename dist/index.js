import Client from "./main";
import fs from "fs";
import path from "path";
const client = new Client('http://localhost:3000/api/v1');
const filePath = path.join(__dirname, "../KR.xls");
const buffer = fs.readFileSync(filePath);
const file = new File([buffer], 'KR.xls', { type: 'text/xls' });
console.log(client.Parser().curriculum(file));
