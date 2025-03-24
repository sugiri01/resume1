
import * as XLSX from 'xlsx';

export interface ColumnDefinition {
  id: string;
  label: string;
  required: boolean;
  autoPopulate?: boolean;
}

export interface ProcessedFileData {
  columns: string[];
  sampleData: any[][];
  allData: any[][];
  error?: string;
  fileName?: string;
}

// Expected columns for the talent management system
export const EXPECTED_COLUMNS: ColumnDefinition[] = [
  { id: 'Name', label: 'Full Name', required: true },
  { id: 'Phone', label: 'Phone Number', required: true },
  { id: 'Email', label: 'Email Address', required: true },
  { id: 'Location', label: 'Location', required: true },
  { id: 'Tech', label: 'Technology Stack', required: true },
  { id: 'Number of Experience', label: 'Years of Experience', required: true },
  { id: 'Data Source', label: 'Source of Data', required: false, autoPopulate: true },
  { id: 'When Data is loaded in database', label: 'Database Upload Date', required: false, autoPopulate: true },
  { id: 'Currency Sal', label: 'Salary (Currency)', required: false },
  { id: 'Which Company working', label: 'Current Company', required: false },
  { id: 'When was the profile updated lastly', label: 'Last Profile Update', required: false, autoPopulate: true }
];

/**
 * Process Excel file data
 * @param file Excel or CSV file
 * @returns ProcessedFileData object with columns and sample data
 */
export const processExcelFile = (file: File): Promise<ProcessedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          return reject(new Error("Failed to read file data"));
        }
        
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          return resolve({
            columns: [],
            sampleData: [],
            allData: [],
            fileName: file.name,
            error: "File doesn't contain enough data to process"
          });
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        return resolve({
          columns: headers,
          sampleData: rows.slice(0, 3), // Get first 3 rows as sample
          allData: rows,
          fileName: file.name
        });
      } catch (err: any) {
        return reject(new Error("Failed to read Excel file. Please ensure it's a valid .xlsx or .csv file."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Transform mapped data to candidates format
 * @param data Full data from Excel file
 * @param mapping Mapping from Excel columns to system fields
 * @returns Array of candidates in the correct format
 */
export const transformDataUsingMapping = (
  data: any[][], 
  columns: string[], 
  mapping: Record<string, string>,
  fileName?: string
): Record<string, string>[] => {
  // Create a list of empty candidates with the correct structure
  return data.map(row => {
    const candidate: Record<string, string> = {};
    
    // Set default value for all expected fields
    EXPECTED_COLUMNS.forEach(col => {
      candidate[col.id] = '';
    });
    
    // Set auto-populated fields
    candidate['When Data is loaded in database'] = new Date().toISOString().split('T')[0];
    candidate['When was the profile updated lastly'] = new Date().toISOString().split('T')[0];
    candidate['Data Source'] = fileName || 'File Upload';
    
    // Map data based on the mapping
    Object.entries(mapping).forEach(([excelCol, targetField]) => {
      if (targetField && targetField !== "do-not-import") {
        const colIndex = columns.findIndex(col => col === excelCol);
        if (colIndex !== -1 && row[colIndex] !== undefined) {
          candidate[targetField] = String(row[colIndex] || '');
        }
      }
    });
    
    return candidate;
  });
};

/**
 * Check if all required fields are mapped
 * @param mapping Current column mapping
 * @returns Boolean indicating if all required fields are mapped
 */
export const areRequiredFieldsMapped = (mapping: Record<string, string>): boolean => {
  const mappedFields = new Set(Object.values(mapping).filter(field => field && field !== "do-not-import"));
  return EXPECTED_COLUMNS
    .filter(col => col.required)
    .every(col => mappedFields.has(col.id));
};
