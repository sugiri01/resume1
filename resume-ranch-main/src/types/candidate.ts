
export interface Candidate {
  Name: string;
  Phone: string;
  Email: string;
  Location: string;
  Tech: string;
  'Number of Experience': string;
  'Data Source': string;
  'When Data is loaded in database': string;
  'Currency Sal': string;
  'Which Company working': string;
  'When was the profile updated lastly': string;
  [key: string]: string; // Index signature to allow dynamic property access
}

export interface UploadHistory {
  filename: string;
  date: string;
  success: number;
  error: number;
  total: number;
}

export interface Column {
  field: string;
  display: string;
  icon: React.ReactNode;
  type: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export type UserRoleType = 'user' | 'admin' | 'super_admin';
