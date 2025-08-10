import Client from "./main";
import fs from "fs"
import path from "path"

const client = new Client('http://localhost:3000/api/v1')

const filePath = path.join(__dirname, "../Test.csv");
const buffer = fs.readFileSync(filePath)
const file = new File([buffer], 'Test.csv', { type: 'text/csv' })
console.log(client.Parser().coaep(file))
