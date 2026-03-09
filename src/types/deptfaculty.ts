export interface Faculty {
  faculty_id: number;
  lastname: string;
  firstname: string;
  middlename: string;
  faculty_type: number;
}

export interface DeptFaculty {
  dept_id: string;
  faculty_id: number;
}

export interface User {
  username: string;
  password: string;
}
