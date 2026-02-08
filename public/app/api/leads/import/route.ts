// app/api/leads/import/route.ts

import { NextResponse } from 'next/server';
import { LeadsAPI } from '@/lib/api/leads';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx'; // Import XLSX for Excel parsing
import { Readable } from 'stream'; // For converting string to stream for csv-parser

export async function POST(request: Request) {
  try {
    console.log("[SERVER_API] /api/leads/import POST request received.");
    console.log("[SERVER_API] Incoming Request Content-Type:", request.headers.get('Content-Type'));

    const formData = await request.formData();
    console.log("[SERVER_API] FormData parsed successfully.");

    const file = (formData.get('file') || formData.get('csvFile')) as File | null;

    if (!file) {
      console.log("[SERVER_API] No file uploaded.");
      return NextResponse.json({ message: 'No file uploaded. Ensure the file is sent under "file" or "csvFile" key.' }, { status: 400 });
    }

    const fileName = file.name || 'unknown_file';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const fileContentType = file.type;

    console.log(`[SERVER_API] File '${fileName}' (${file.size} bytes, Type: ${fileContentType}) received.`);

    let rawParsedLeads: any[] = []; // This will hold the raw data parsed from the CSV/XLSX file

    // --- File Type Parsing ---
    if (fileExtension === 'csv' || fileContentType === 'text/csv') {
      console.log("[SERVER_API] Identified as CSV. Starting CSV parsing with csv-parser...");
      const fileContent = await file.text();

      await new Promise<void>((resolve, reject) => {
        const readableStream = new Readable();
        readableStream.push(fileContent);
        readableStream.push(null); // Signal end of stream

        readableStream
          .pipe(csvParser())
          .on('data', (data) => {
            rawParsedLeads.push(data);
          })
          .on('end', () => {
            console.log(`[SERVER_API] CSV parsing completed. ${rawParsedLeads.length} rows parsed.`);
            resolve();
          })
          .on('error', (error) => {
            console.error("[SERVER_API] CSV parsing error:", error);
            reject(error);
          });
      });
    } else if (fileExtension === 'xlsx' ||
               fileContentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
               fileContentType === 'application/vnd.ms-excel') {
      console.log("[SERVER_API] Identified as XLSX. Starting XLSX parsing with SheetJS...");
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const worksheet = workbook.Sheets[sheetName];
        rawParsedLeads = XLSX.utils.sheet_to_json(worksheet); // Convert sheet data to JSON array

        console.log(`[SERVER_API] XLSX parsing completed. ${rawParsedLeads.length} rows parsed.`);
      } catch (xlsxError: any) {
        console.error("[SERVER_API] XLSX parsing error:", xlsxError);
        return NextResponse.json(
          { message: `Failed to parse XLSX file: ${xlsxError.message || 'Corrupted file format'}` },
          { status: 400 }
        );
      }
    } else {
      console.log(`[SERVER_API] Unsupported file type: '${fileName}' with content type '${fileContentType}'.`);
      return NextResponse.json({ message: 'Unsupported file type. Only CSV and XLSX files are allowed.' }, { status: 400 });
    }

    if (rawParsedLeads.length === 0) {
      console.log("[SERVER_API] No data rows found in the parsed file.");
      return NextResponse.json(
        { message: 'File parsed successfully, but no lead data rows were found. Please check your file content.' },
        { status: 400 }
      );
    }

    // --- Start Lead Validation and Transformation ---
    console.log("[SERVER_API] Starting lead data validation and transformation...");
    const finalLeadsToImport: any[] = [];
    const preValidationErrors: string[] = []; // Collects errors found before sending to DB
    const phoneNumbersInFile = new Set<string>(); // Used to check for duplicate phone numbers within the current upload file

    rawParsedLeads.forEach((rawLead: any, index: number) => {
      const originalRow = index + 2; // Assuming row 1 is headers, so data starts from row 2
      let leadIsValid = true;
      const leadErrors: string[] = [];

      // Create a clean lead object with lowercase and trimmed keys for consistency
      const lead: any = {};
      for (const key in rawLead) {
        lead[String(key).toLowerCase().trim()] = rawLead[key];
      }

      // 1. Basic Required Fields Check (Essential for any lead)
      if (!lead.name || String(lead.name).trim() === '') {
        leadErrors.push(`Row ${originalRow}: 'name' is missing or empty.`);
        leadIsValid = false;
      }
      if (!lead.phone || String(lead.phone).trim() === '') {
        leadErrors.push(`Row ${originalRow}: 'phone' is missing or empty.`);
        leadIsValid = false;
      }
      // NEW CHECK: Make 'leadType' a required field
      if (!lead['lead type'] || String(lead['lead type']).trim() === '') { // Use bracket notation for multi-word keys
        leadErrors.push(`Row ${originalRow}: 'lead type' is missing or empty.`);
        leadIsValid = false;
      }


      let processedPhoneNumber = String(lead.phone || '').trim(); // Ensure it's a string, even if null/undefined

      // 4. If there are 2 numbers in the column then take the first one before the ' , ' or ' / '
      if (processedPhoneNumber.includes(',') || processedPhoneNumber.includes('/')) {
        const separator = processedPhoneNumber.includes(',') ? ',' : '/';
        processedPhoneNumber = processedPhoneNumber.split(separator)[0].trim();
      }

      // Remove any non-digit characters from the phone number (e.g., spaces, hyphens, parentheses)
      // but preserve a leading '+' for international format.
      processedPhoneNumber = processedPhoneNumber.replace(/[^+\d]/g, '');

      // 3. If the number doesn't have +91, then add the +91
      if (!processedPhoneNumber.startsWith('+91')) {
        // Handle common cases like "09876543210" by removing leading '0' before adding '+91'
        if (processedPhoneNumber.startsWith('0') && processedPhoneNumber.length === 11) {
            processedPhoneNumber = processedPhoneNumber.substring(1); // Remove leading '0'
        }
        processedPhoneNumber = '+91' + processedPhoneNumber;
      }

      // 2. Invalid number like the number which is not an Indian number or has more than 10 after +91 or less than 10 after +91
      // Regex for Indian mobile numbers: starts with +91, followed by a digit from 6-9, then 9 more digits.
      // This ensures 10 digits after +91 and a valid starting digit for Indian mobile numbers.
      const indianMobileRegex = /^\+91[6789]\d{9}$/;
      if (!indianMobileRegex.test(processedPhoneNumber)) {
        leadErrors.push(`Row ${originalRow}: Phone number '${lead.phone}' is not a valid 10-digit Indian mobile number (e.g., must be +91 followed by 10 digits starting with 6,7,8, or 9).`);
        leadIsValid = false;
      }

      // 1. Same number - must not be imported from the file (in-file duplicate check)
      if (phoneNumbersInFile.has(processedPhoneNumber)) {
        leadErrors.push(`Row ${originalRow}: Duplicate phone number '${processedPhoneNumber}' found within the uploaded file.`);
        leadIsValid = false;
      } else {
        // Add to set only if it's a validly formatted number to avoid checking invalid numbers for duplicates
        if (indianMobileRegex.test(processedPhoneNumber)) {
            phoneNumbersInFile.add(processedPhoneNumber);
        }
      }
      
      // Update the lead object with the processed phone number
      lead.phone = processedPhoneNumber;

      // Add to final leads or collect errors
      if (!leadIsValid) {
        preValidationErrors.push(...leadErrors);
      } else {
        finalLeadsToImport.push(lead);
      }
    });

    console.log(`[SERVER_API] Validation completed. ${finalLeadsToImport.length} valid leads, ${preValidationErrors.length} pre-validation errors.`);

    // If no leads are valid after pre-validation, return a 400
    if (finalLeadsToImport.length === 0) {
      return NextResponse.json(
        {
          total: rawParsedLeads.length,
          successful: 0,
          failed: rawParsedLeads.length,
          errors: preValidationErrors.length > 0 ? preValidationErrors : ['No valid leads found after processing the file.'],
        },
        { status: 400 }
      );
    }

    console.log("[SERVER_API] Calling LeadsAPI.bulkCreateLeads with validated data...");
    // LeadsAPI.bulkCreateLeads is assumed to handle database-level uniqueness checks (e.g., for existing numbers in DB)
    // and returns results in the format: { successful: number; failed: number; errors: string[]; }
    const dbImportResults = await LeadsAPI.bulkCreateLeads(finalLeadsToImport);

    // Combine pre-validation errors with database import results
    const combinedErrors = [...preValidationErrors, ...dbImportResults.errors];
    // Calculate total failed leads: (Original total - leads that passed pre-validation) + leads that failed in DB
    const totalFailed = (rawParsedLeads.length - finalLeadsToImport.length) + dbImportResults.failed; 

    return NextResponse.json(
      {
        total: rawParsedLeads.length, // Total rows originally in the file
        successful: dbImportResults.successful,
        failed: totalFailed,
        errors: combinedErrors,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[SERVER_API] Global Error during lead import:', error);

    // Specific error handling for Content-Type mismatch (still relevant if frontend is not correctly sending FormData)
    if (error instanceof TypeError && error.message.includes('Content-Type')) {
        console.error("[SERVER_API] Content-Type Mismatch: The frontend is NOT sending 'multipart/form-data'.");
        console.error("[SERVER_API] Please ensure your frontend's fetch/axios call sends the file using 'FormData' as the body.");
        return NextResponse.json(
            {
                message: 'Invalid request format: Frontend must send file data as "multipart/form-data".',
                error: error.message,
                details: "The server expected file upload via FormData, but received a different content type. Please review your frontend's API call for file import.",
                solution: "In your frontend's fetch/axios call, make sure you create a new FormData() object, append your file to it, and set this FormData object as the 'body' of the request. Do NOT manually set 'Content-Type' header for FormData."
            },
            { status: 400 } // Bad Request
        );
    }

    // Generic error handling for other server-side issues
    return NextResponse.json(
      {
        message: 'Internal server error occurred during file processing.',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        total: 0, successful: 0, failed: 0, errors: [`Server error: ${error.message || 'Unknown error occurred.'}`]
      },
      { status: 500 }
    );
  }
}
