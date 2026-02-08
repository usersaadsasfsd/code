/**
 * Date utility functions for handling DD-MM-YYYY format
 */

/**
 * Convert DD-MM-YYYY string to Date object
 * Also supports DD/MM/YYYY, MM-DD-YYYY, and other common formats
 */
export function parseDDMMYYYY(dateString: string): Date | null {
  if (!dateString) return null;

  // Trim whitespace and convert to string
  const trimmed = String(dateString).trim();
  if (!trimmed) return null;

  // Try DD-MM-YYYY format first (most common for Indian locale)
  const ddmmyyyyDashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDashMatch) {
    const [, day, month, year] = ddmmyyyyDashMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    // Validate that the date is actually valid
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try DD/MM/YYYY format
  const ddmmyyyySlashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyySlashMatch) {
    const [, day, month, year] = ddmmyyyySlashMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try DD.MM.YYYY format (European style)
  const ddmmyyyyDotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyyDotMatch) {
    const [, day, month, year] = ddmmyyyyDotMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try YYYY-MM-DD format (ISO format)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try to handle Excel serial date numbers (common in XLSX imports)
  const numValue = Number(trimmed);
  if (!isNaN(numValue) && numValue > 25569 && numValue < 50000) {
    // Excel dates are days since 1900-01-01 (with a bug for 1900 leap year)
    // 25569 = 1970-01-01 in Excel serial format
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const date = new Date(excelEpoch.getTime() + numValue * 24 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback: try parsing as ISO string or other formats
  const fallbackDate = new Date(trimmed);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  return null;
}

/**
 * Format Date object to DD-MM-YYYY string
 */
export function formatToDDMMYYYY(date: Date | string | undefined): string {
  if (!date) return "";

  let dateObj: Date;
  
  if (typeof date === "string") {
    // First try parsing as DD-MM-YYYY format
    const parsed = parseDDMMYYYY(date);
    dateObj = parsed || new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) return "";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Format Date object to DD-MM-YYYY HH:MM string
 */
export function formatToDDMMYYYYWithTime(date: Date | string | undefined): string {
  if (!date) return "";

  let dateObj: Date;
  
  if (typeof date === "string") {
    // First try parsing as DD-MM-YYYY format
    const parsed = parseDDMMYYYY(date);
    dateObj = parsed || new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) return "";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}
