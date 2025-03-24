
import { useState } from 'react';
import { Candidate } from '@/types/candidate';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseFileUploadProps {
  emptyCandidate: Candidate;
  onUploadSuccess: (candidates: Candidate[], fileName: string) => void;
  userId?: string;
}

const useFileUpload = ({ emptyCandidate, onUploadSuccess, userId }: UseFileUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Reset upload state
  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const validExts = ['.xlsx', '.xls', '.csv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(fileExt)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel or CSV file",
        variant: "destructive"
      });
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(10);

    try {
      // Simulate reading the file and processing data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(30);

      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simulate processing
          setUploadProgress(50);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setUploadProgress(70);

          // Generate sample data for now (in a real app this would parse the file)
          const mockCandidates: Candidate[] = Array(Math.floor(Math.random() * 10) + 5)
            .fill(null)
            .map((_, i) => ({
              ...emptyCandidate,
              Name: `Candidate from ${file.name} #${i + 1}`,
              Email: `candidate${i + 1}@example.com`,
              Phone: `+1 555-${100 + i}`,
              'Tech': `React, Node.js`,
              'Number of Experience': `${Math.floor(Math.random() * 10) + 1}`,
              'Data Source': file.name,
              'When Data is loaded in database': new Date().toISOString().split('T')[0],
              'When was the profile updated lastly': new Date().toISOString().split('T')[0],
              'Location': `City ${i + 1}`,
              'Currency Sal': `$${Math.floor(Math.random() * 50) + 50}K`,
              'Which Company working': `Company ${i + 1}`
            }));

          setUploadProgress(90);

          // Record the upload in the database
          const totalRecords = mockCandidates.length;
          const { error } = await supabase
            .from('upload_history')
            .insert({
              filename: file.name,
              total_records: totalRecords,
              success_count: totalRecords,
              error_count: 0,
              user_id: userId
            });

          if (error) {
            console.error('Error recording upload history:', error);
          }

          setUploadProgress(100);
          setUploadStatus('success');
          
          // Call the success callback
          onUploadSuccess(mockCandidates, file.name);
          
          toast({
            title: "Upload Successful",
            description: `${mockCandidates.length} candidates imported from ${file.name}`,
            variant: "default"
          });
        } catch (error: any) {
          console.error('Error processing file:', error);
          setUploadStatus('error');
          toast({
            title: "Upload Failed",
            description: error.message || "Failed to process file",
            variant: "destructive"
          });
        }
      };

      reader.onerror = () => {
        setUploadStatus('error');
        toast({
          title: "Upload Failed",
          description: "Failed to read file",
          variant: "destructive"
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    }
  };

  return {
    uploadStatus,
    uploadProgress,
    handleFileUpload,
    resetUpload
  };
};

export default useFileUpload;
