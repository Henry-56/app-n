import { parse } from "csv-parse/sync";

export class CSVParser {
  static parse(csvContent: string): any[] {
    try {
      return parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      });
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw new Error("Failed to parse CSV file. Ensure it is a valid CSV with headers.");
    }
  }
}
