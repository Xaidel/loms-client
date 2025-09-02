import Client from "./main";
import fs from "fs"
import path from "path"

const client = new Client('http://localhost:3000/api/v1')

const filePath = path.join(__dirname, "../Test.csv");
const buffer = fs.readFileSync(filePath)
const file = new File([buffer], 'Test.csv', { type: 'text/csv' })
client.Parser().assessmentData(file)
  .then(result => console.log(result))
  .catch(err => console.error("Error uploading COAEP:", err))
