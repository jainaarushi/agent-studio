/**
 * File parser — extracts text content from uploaded files.
 * Supports: PDF, DOCX, DOC, XLSX, XLS, TXT, CSV, JSON, MD
 * Images (JPG, PNG, GIF, WEBP) return base64 for LLM vision APIs.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SUPPORTED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "text/plain": "txt",
  "text/csv": "csv",
  "text/markdown": "md",
  "application/json": "json",
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
};

export interface ParsedFile {
  filename: string;
  mimeType: string;
  fileType: string;
  textContent: string | null;
  base64Image: string | null;
  sizeBytes: number;
  error?: string;
}

export function isSupported(mimeType: string): boolean {
  return mimeType in SUPPORTED_TYPES;
}

export function getSupportedExtensions(): string[] {
  return [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt", ".csv", ".json", ".md", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
}

export async function parseFile(buffer: Buffer, filename: string, mimeType: string): Promise<ParsedFile> {
  const result: ParsedFile = {
    filename,
    mimeType,
    fileType: SUPPORTED_TYPES[mimeType] || "unknown",
    textContent: null,
    base64Image: null,
    sizeBytes: buffer.length,
  };

  if (buffer.length > MAX_FILE_SIZE) {
    result.error = `File too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Max is 10MB.`;
    return result;
  }

  if (!isSupported(mimeType)) {
    result.error = `Unsupported file type: ${mimeType}`;
    return result;
  }

  try {
    switch (result.fileType) {
      case "pdf": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfModule = await import("pdf-parse") as any;
        const pdfParse = pdfModule.default || pdfModule;
        const data = await pdfParse(buffer);
        result.textContent = data.text.trim();
        if (!result.textContent) {
          result.error = "PDF appears to be image-only (no extractable text).";
        }
        break;
      }

      case "docx":
      case "doc": {
        const mammoth = await import("mammoth");
        const { value } = await mammoth.extractRawText({ buffer });
        result.textContent = value.trim();
        break;
      }

      case "xlsx":
      case "xls": {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheets: string[] = [];
        for (const name of workbook.SheetNames) {
          const sheet = workbook.Sheets[name];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv.trim()) {
            sheets.push(`--- Sheet: ${name} ---\n${csv.trim()}`);
          }
        }
        result.textContent = sheets.join("\n\n");
        break;
      }

      case "txt":
      case "csv":
      case "md":
      case "json": {
        result.textContent = buffer.toString("utf-8").trim();
        break;
      }

      case "image": {
        result.base64Image = buffer.toString("base64");
        break;
      }
    }
  } catch (err) {
    result.error = `Failed to parse ${filename}: ${err instanceof Error ? err.message : "Unknown error"}`;
  }

  return result;
}
