# COAEP Parser Testing Area

This directory contains test files and sample data for testing the COAEP parser functionality.

## Files

- **coaep.test.ts** - Main test file with multiple test cases
- **sample-coaep.csv** - Sample COAEP CSV file for manual testing
- **interactive-test.ts** - Interactive testing script for loading and parsing CSV files

## Running Tests

**Note:** Use `tsx` instead of `ts-node` due to ESM module configuration.

### Option 1: Run the test suite

```bash
npx tsx src/test/coaep/coaep.test.ts
```

### Option 2: Interactive testing with sample CSV

```bash
npx tsx src/test/coaep/interactive-test.ts
```

### Option 3: Test with custom CSV file

```bash
npx tsx src/test/coaep/interactive-test.ts path/to/your/file.csv
```

## Test Cases Covered

1. **Valid COAEP CSV** - Tests parsing of properly formatted COAEP data ✅
2. **Missing Headers** - Tests error handling when headers are not found ✅
3. **Incomplete Data** - Tests parsing with missing ILO/assessment information ✅
4. **Empty String** - Tests behavior with empty input ✅
5. **Structure Verification** - Validates the parsed output structure and data ✅

All tests are passing successfully.

## Expected Output Structure

```typescript
{
  COAEP: {
    faculty: string | null,
    course: string | null,
    sy: string | null,
    semester: number | null,
    co: [
      {
        statement: string,
        verb: string,
        ilo: [
          {
            statement: string,
            verb: string,
            assessment_tool: string,
            performance_target: number | null,
            passing_score: number | null
          }
        ]
      }
    ]
  }
}
```

## Notes

- The parser dynamically detects header rows
- Performance targets are extracted from text (e.g., "80% of students will score 75%" → target: 80, score: 75)
- Instructional verbs are automatically extracted from statements
- Empty or malformed CSV files will return error objects
