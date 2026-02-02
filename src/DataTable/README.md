# DataTable Module Documentation

The **DataTable Module** is a generic, type-safe framework designed to ingest tabular data (CSV/Excel), perform robust validation against business rules, and transform the data into structured JSON objects.

This documentation focuses on the **COAEP** (Course Outcome Assessment and Evaluation Plan) implementation, which converts raw curriculum map files into hierarchical TypeScript interfaces.

---

## Usage Guide

The core workflow consists of three steps: **Initialize**, **Validate**, and **Convert**.

### 1. Initialization

First, instantiate the specific `DataTable` implementation (e.g., `CoaepDT`) and load it with data. The data source can be a raw CSV string or a file object.

```typescript
import { CoaepDT } from "./DataTable/models/CoaepDT";

// 1. Instantiate
const coaepDT = new CoaepDT();

// 2. Initialize with CSV data (string)
// Note: initializeTable() is async. You must wait for it.
const result = await coaepDT.initializeTable(csvDataString);
```

Note that the returned result is wrapped in ParserResult<DataTableInfo>:

```json
// Example success initializeTable() result
result: ParserResult<DataTableInfo> = {
  "success": true,    // boolean
  "message": "Successfully fetched datatable.",
  "data": {
    "name": "CoaepDT",  // string
    "table": [...],     // (string | null)[][], the 2D array of cell values
    "headers": [...]    // string[], the array of column headers
  },
  "error": undefined    // defined when success == false
}
```

```typescript
// 3. Check for success
if (!result.success) {
  console.error("Failed to load table:", result.message);
}
```

### 2. Fetching & Modifying Data

You can retrieve the internal grid representation to display or edit raw values before final processing.

```typescript
// Fetch the current state of the table
const tableResult = coaepDT.getTable(); // ParserResult<DataTableInfo>

if (tableResult.success) {
  const { table } = tableResult.data; // (string | null)[][]

  // Example: Modifying a cell (Row 0, Column 3)
  // This is useful for fixing errors found during validation
  table[0][3] = "Updated Assessment Tool";

  // Commit changes back to the instance
  // Note: Also async as it checks if table is initialized and compatible
  await coaepDT.setTable(table);
}
```

### 3. Validation

Run the validation pipeline. This executes all built-in and registered custom validators (e.g., ensuring taxonomy alignment) and returns a ParserResult with arrays of success and errors as DataTableExeptions.

```typescript
// 1. Run validations
const validationResult = await coaepDT.validate();
```

```json
// Example validation success result
validationResult: ParserResult<{
  validMsgs: string[],
  tableErrors: DataTableException[]}
  > = {
  "success": true,    // boolean
  "message": "CoaepDT ran its validations...",
  "data": {
    "validMsgs": [...], // string[]
    "tableErrors": [...], // DataTableException[]
  },
  "error": undefined    // defined when success == false
}

// Example error: Empty assessment tool cell
tableErrors: DataTableException[] = [
  {
    "error": "Cannot have empty Assessment Tool.", // string
    "row": 2,       // optional, number
    "column": 3,    // optional, number
    "from": "COAEPDT_TO_JSON", // name of the validator that reported the error
    "cause": undefined // optional, carries uncaught Errors/Exceptions
  },
  ...
]
```

```typescript
// 2. Check for specific validation errors
if (validationResult.data.tableErrors.length > 0) {
  validationResult.data.tableErrors.forEach((err) => {
    // 'row' and 'column' point to the cell in the table
    console.error(`Error at [${err.row}, ${err.column}]: ${err.error}`);
  });
} else {
  console.log("All validations passed!");
}
```

### 4. Conversion to JSON

Finally, transform the validated table into a JSON object to be passed to the backend.

```typescript
// 1. Convert
const jsonResult: ParserResult<{
  jsonObj: COAEP;
  validMsgs: string[];
  tableErrors: DataTableException[];
}> = await coaepDT.toJson();
```

Note that the toJson() method returns the object wrapped in a ParserResult. For COAEP DT, the jsonObj is a COAEP object.

```json
// Example success toJson() result
jsonResult: ParserResult<{
  jsonObj: COAEP,
  validMsgs: string[],
  tableErrors: DataTableException[]
  }> = {
  "success": true,    // boolean
  "message": "Successfully converted to JSON.",
  "data": {
    "jsonObj": {...}, // COAEP object
    "validMsgs": [
      "Successfully converted COAEP datatable to JSON.",
      ...
    ], // string[]
    "tableErrors": [], // DataTableException[], no errors
  },
  "error": undefined    // defined when success == false
}
```

```typescript
// 2. Check for success
if (jsonResult.success) {
  const coaepData = jsonResult.data.jsonObj;
  console.log("Faculty:", coaepData.faculty);
  console.log("First CO:", coaepData.co[0].statement);
}
```

---

## Architecture

The system is built on a modular `DataTable<T>` abstract class.

### Core Components

| Component          | Description                                                                                                                                                   |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`DataTable<T>`** | The abstract base class. Handles state management (`table`, `headers`), basic parsing logic, and the validation orchestration pipeline.                       |
| **`CoaepDT`**      | Implementation for **COAEP**. Handles specific CSV structure parsing (header detection, merged cell handling) and NLP extraction (Taxonomy/Cognitive levels). |
| **`DTValidator`**  | Strategy pattern for validation rules. Validators are "plugged in" to the DataTable instance to keep business logic separate from parsing logic.              |

---

## COAEP Validation Rules

The `CoaepDT` comes pre-configured with the following business rules:

1.  **`MinCOtaxo` (Minimum CO Taxonomy)**
    - **Rule:** A Course Outcome (CO) must have a taxonomy level of **Applying** or higher.
    - **Error:** "Remembering" or "Understanding" at the CO level will flag an error.

2.  **`LastILOTaxo` (Outcome Alignment)**
    - **Rule:** The _last_ Intended Learning Outcome (ILO) within a CO must match the taxonomy level of the CO itself.
    - **Purpose:** Ensures the final step of the learning process meets the target outcome.

3.  **`ILOTaxoOrder` (Progressive Complexity)**
    - **Rule:** ILOs within a single CO must be ordered by complexity.
    - **Error:** An ILO cannot have a lower taxonomy level (e.g., _Remembering_) than the one preceding it (e.g., _Analyzing_).

---

## Data Structures

The parser transforms the flat CSV grid into the following hierarchy:

```typescript
interface COAEP {
  faculty: string | null;
  course: string | null;
  co: CO[]; // Array of Course Outcomes
}

interface CO {
  statement: string;
  taxonomy_level: string; // e.g. "creating"
  ilo: ILO[]; // Array of Intended Learning Outcomes
}

interface ILO {
  statement: string;
  assessment_tool: string;
  performance_target: number;
  passing_score: number;
  taxonomy_level: string; // e.g. "understanding"
}
```

The ParserResult is used to wrap await responses with error checking.

```typescript
export type ParserResult<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};
```

The DataTableException is used to wrap data table validation errors, and store indices if there are any.

```typescript
export type DataTableException = {
  error: string;
  row?: number;
  column?: number;
  from?: string;
  cause?: any;
};
```

The DataTableInfo is used to interface the internal state of the DataTable.

```typescript
export type DataTableInfo = {
  name: string;
  table: (string | null)[][];
  headers: string[];
};
```

---

## Common Issues & Troubleshooting

- **"Datatable is unset"**: You must call `await coaepDT.initializeTable(csv)` before accessing data or running validations.
- **Missing Headers**: The parser looks for specific keywords (e.g., "Course Outcome Statement") to identify the header row. Ensure the input file follows the standard COAEP template.
- **Validation Errors**: Use the `row` and `column` properties in `tableErrors` to highlight the exact cell causing the issue in your UI.
