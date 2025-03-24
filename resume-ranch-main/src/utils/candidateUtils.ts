import { Candidate, UploadHistory } from '@/types/candidate';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

// Define column mappings (Excel column name -> Our field name)
export const columnMappings: Record<string, string> = {
  'Full Name': 'Name',
  'Name': 'Name',
  'Phone Number': 'Phone',
  'Phone': 'Phone',
  'Mobile': 'Phone',
  'Email ID': 'Email',
  'Email Address': 'Email',
  'Email': 'Email',
  'Current Location': 'Location',
  'Location': 'Location',
  'City': 'Location',
  'Key Skills': 'Tech',
  'Technology Stack': 'Tech',
  'Technology': 'Tech',
  'Tech': 'Tech',
  'Skills': 'Tech',
  'Total Experience': 'Number of Experience',
  'Experience': 'Number of Experience',
  'Years of Experience': 'Number of Experience',
  'Number of Experience': 'Number of Experience',
  'Data Source': 'Data Source',
  'Source': 'Data Source',
  'Source of Data': 'Data Source',
  'Annual Salary': 'Currency Sal',
  'Salary': 'Currency Sal',
  'Salary (Currency)': 'Currency Sal',
  'Currency Sal': 'Currency Sal',
  'Current Company': 'Which Company working',
  'Company': 'Which Company working',
  'Curr. Company name': 'Which Company working',
  'Which Company working': 'Which Company working'
};

// Fetch candidates from Supabase
export const fetchCandidates = async (userId: string, toast: any) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      // Handle specific error related to PostgreSQL roles vs application roles
      if (error.message.includes('role "super_admin" does not exist')) {
        console.error('This is a PostgreSQL role error, not related to application roles');
        // Return empty array for now to prevent UI from breaking
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    toast({
      title: "Error fetching candidates",
      description: error.message || "Failed to fetch candidates",
      variant: "destructive"
    });
    return [];
  }
};

// Save candidates to Supabase
export const saveCandidatesToSupabase = async (candidates: Candidate[], userId: string, toast: any) => {
  try {
    // Add all candidates with user_id
    const candidatesWithUserId = candidates.map(candidate => ({
      ...candidate,
      user_id: userId
    }));
    
    const { error } = await supabase
      .from('candidates')
      .insert(candidatesWithUserId);
    
    if (error) throw error;
    
    toast({
      title: "Candidates saved",
      description: "Your candidates have been saved to the database",
      variant: "default"
    });
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error saving candidates",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

// Update a single candidate in Supabase
export const updateCandidateInSupabase = async (candidate: Candidate, userId: string, toast: any) => {
  try {
    const candidateWithUserId = {
      ...candidate,
      user_id: userId
    };
    
    // Find the candidate by Name and Email
    const { data, error: fetchError } = await supabase
      .from('candidates')
      .select('id')
      .eq('Name', candidate.Name)
      .eq('Email', candidate.Email)
      .eq('user_id', userId);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Candidate not found in database');
    }
    
    // Update the record by id
    const { error: updateError } = await supabase
      .from('candidates')
      .update(candidateWithUserId)
      .eq('id', data[0].id);
    
    if (updateError) {
      throw updateError;
    }
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error updating candidate",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

// Process Excel data
export const processExcelData = (
  jsonData: any[], 
  fileName: string, 
  emptyCandidate: Candidate
): Candidate[] => {
  // Process each record into a properly typed Candidate object
  return jsonData.map((record: any) => {
    // Create a new candidate object with default values
    const candidate: Candidate = {...emptyCandidate};
    
    // Set today's date for the date fields
    candidate['When Data is loaded in database'] = new Date().toISOString().split('T')[0];
    candidate['When was the profile updated lastly'] = new Date().toISOString().split('T')[0];
    candidate['Data Source'] = fileName;
    
    // Map each property from the Excel record to our candidate object
    Object.entries(record).forEach(([excelKey, value]: [string, any]) => {
      // Try to find a matching field in our data model
      const mappedField = columnMappings[excelKey] || excelKey;
      
      // If we have a valid field in our model, set the value
      if (candidate.hasOwnProperty(mappedField)) {
        candidate[mappedField] = String(value || '');
      }
    });
    
    return candidate;
  });
};

// Download candidates as Excel file
export const downloadCandidates = (candidates: Candidate[], toast: any) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(candidates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, "candidates.xlsx");
    
    toast({
      title: "Download Successful",
      description: "Your candidates data has been downloaded",
      variant: "default"
    });
  } catch (error) {
    toast({
      title: "Download Failed",
      description: "There was an error downloading your data",
      variant: "destructive"
    });
  }
};

// Download template Excel file
export const downloadTemplate = (toast: any) => {
  try {
    // Create a template with column names
    const template = [
      {
        'Full Name': '',
        'Phone Number': '',
        'Email Address': '',
        'Location': '',
        'Technology Stack': '',
        'Years of Experience': '',
        'Current Company': '',
        'Salary': ''
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "candidate-template.xlsx");
    
    toast({
      title: "Template Downloaded",
      description: "Your candidate template has been downloaded",
      variant: "default"
    });
  } catch (error) {
    toast({
      title: "Download Failed",
      description: "There was an error downloading the template",
      variant: "destructive"
    });
  }
};
