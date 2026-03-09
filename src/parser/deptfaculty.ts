import Papa from "papaparse";
import { Faculty, DeptFaculty, User } from "../types/deptfaculty";

export type deptFacultyCsvRow = {
  "Dept ID": string;
  "No.": number;
  "Fac ID": number;
  Name: string;
  "Admin?": string;
  "Designation Title": string;
  Category: string;
};

export interface DeptFacultyParseResult {
  faculties: Faculty[];
  deptFaculties: DeptFaculty[];
  users: User[];
}

// Parses name in the format of `Lastname Firstnames Middlename`
const parseFullName = (fullName: string) => {
  const names = fullName.split(" ");
  let lastname, firstname, middlename;
  lastname = firstname = middlename = "";

  // Take the last name
  lastname = names.shift();

  // If more than 1 name left, take the middle name
  if (names.length > 1) middlename = names.pop();

  // Join the rest as the first name
  firstname = names.join(" ");

  return { lastname, firstname, middlename };
};

// Mappings of Category to Faculty Type
const mapCategories: { [key: string]: number } = {
  "FULL TIME": 1,
  "PART TIME A": 2,
  "PART TIME B": 3,
  "PART TIME C": 4,
  "PART TIME D": 5,
};

// Maps CSV Attributes to Table Attributes depending on Version
// Assumes that the CSV Attributes are already validated
export const attributeMapping = (row: deptFacultyCsvRow) => {
  const { lastname, firstname, middlename } = parseFullName(row.Name);

  const faculty: Faculty = {
    faculty_id: row["Fac ID"],
    lastname: lastname,
    firstname: firstname,
    middlename: middlename,
    faculty_type: mapCategories[row.Category],
  } as Faculty;

  const deptFaculty: DeptFaculty = {
    dept_id: row["Dept ID"],
    faculty_id: +row["Fac ID"],
  };

  const user: User = {
    username: row["Fac ID"].toString().padStart(4, "0"),
    password: "",
  };

  return {
    faculty,
    deptFaculty,
    user,
  };
};

export function parseDeptFaculty(csvData: string) {
  const parsed = Papa.parse<deptFacultyCsvRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  const faculties: Faculty[] = [];
  const deptFaculties: DeptFaculty[] = [];
  const users: User[] = [];

  for (const row of parsed.data as deptFacultyCsvRow[]) {
    const { faculty, deptFaculty, user } = attributeMapping(row);
    faculties.push(faculty);
    deptFaculties.push(deptFaculty);
    users.push(user);
  }

  return {
    faculties,
    deptFaculties,
    users,
  };
}
