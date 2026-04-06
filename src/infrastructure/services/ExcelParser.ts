import * as XLSX from "xlsx";

export class ExcelParser {
  static parse(buffer: Buffer): any[] {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      return data;
    } catch (error) {
      console.error("Error parsing Excel:", error);
      throw new Error("Failed to parse Excel file. Ensure it is a valid .xlsx file.");
    }
  }
}
