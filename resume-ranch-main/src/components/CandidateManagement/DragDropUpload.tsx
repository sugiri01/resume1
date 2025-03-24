
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { processExcelFile, transformDataUsingMapping } from '@/utils/mappingUtils';
import ColumnMappingWorkflow from './ColumnMappingWorkflow';
import UploadHistoryViewer from './UploadHistoryViewer';
import FileDropZone from './FileDropZone';
import UploadProgress from './UploadProgress';
import { supabase, hasApiKeyError, hasRoleError } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import '../../ExcelMapping.css';

interface DragDropUploadProps {
  columns: { field: string; display: string; icon: React.ReactNode; type: string }[];
  uploadStatus: string;
  uploadProgress: number;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplateDownload: () => void;
  uploadHistory: { filename: string; date: string; success: number; error: number; total: number }[];
}

interface CandidateRecord {
  Name: string;
  Phone?: string;
  Email?: string;
  Location?: string;
  Tech?: string;
  "Number of Experience"?: string;
  "Data Source"?: string;
  "When Data is loaded in database"?: string;
  "Currency Sal"?: string;
  "Which Company working"?: string;
  "When was the profile updated lastly"?: string;
  user_id?: string;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  columns,
  uploadStatus,
  onFileUpload,
  onTemplateDownload,
  uploadHistory
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[][]>([]);
  const [allData, setAllData] = useState<any[][]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dbConfigIssue, setDbConfigIssue] = useState(false);
  const [apiKeyIssue, setApiKeyIssue] = useState(false);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setLoading(true);
    
    try {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !['xlsx', 'xls', 'csv'].includes(fileExtension)) {
        throw new Error('Please upload an Excel or CSV file');
      }
      
      const processedData = await processExcelFile(selectedFile);
      
      if (processedData.error) {
        throw new Error(processedData.error);
      }
      
      setFileColumns(processedData.columns);
      setSampleData(processedData.sampleData);
      setAllData(processedData.allData);
      setShowMapping(true);
      
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error Processing File",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a wrapper to handle file selection from FileDropZone
  const handleFileSelect = (selectedFile: File) => {
    // Create a mock event to pass to the parent component
    const mockEvent = {
      target: {
        files: [selectedFile]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    onFileUpload(mockEvent);
  };

  const handleMappingComplete = async (mapping: Record<string, string>) => {
    try {
      const transformedData = transformDataUsingMapping(allData, fileColumns, mapping, file?.name);
      
      setIsUploading(true);
      setTotalRecords(transformedData.length);
      setSuccessCount(0);
      setErrorCount(0);
      setUploadProgress(0);
      setDbConfigIssue(false);
      setApiKeyIssue(false);
      
      const uploadHistoryRecord = {
        user_id: user?.id,
        filename: file?.name || 'Unknown file',
        total_records: transformedData.length,
        success_count: 0,
        error_count: 0
      };
      
      try {
        const { data: uploadData, error: uploadError } = await supabase
          .from('upload_history')
          .insert(uploadHistoryRecord)
          .select()
          .single();
        
        if (uploadError) {
          console.error('Error creating upload record:', uploadError);
          
          if (hasApiKeyError(uploadError)) {
            setApiKeyIssue(true);
            toast({
              title: "API Key Error",
              description: "There's an API key configuration issue. Your data will still be processed locally.",
              variant: "destructive",
            });
          } else if (hasRoleError(uploadError)) {
            setDbConfigIssue(true);
            toast({
              title: "Database Configuration Notice",
              description: "There's a role configuration issue but your data will still be processed.",
              variant: "default",
            });
          } else {
            toast({
              title: "Warning",
              description: `Upload history recording failed: ${uploadError.message}. Continuing with upload.`,
              variant: "destructive"
            });
          }
        }
        
        const uploadId = uploadData?.id;
        let successCount = 0;
        let errorCount = 0;
        const failedRecords: any[] = [];
        
        for (let i = 0; i < transformedData.length; i++) {
          try {
            const record = transformedData[i] as Record<string, string>;
            
            if (!record.Name) {
              throw new Error('Name field is required but missing');
            }
            
            const candidateRecord = {
              Name: record.Name,
              Phone: record.Phone,
              Email: record.Email,
              Location: record.Location,
              Tech: record.Tech,
              "Number of Experience": record["Number of Experience"],
              "Data Source": record["Data Source"],
              "When Data is loaded in database": record["When Data is loaded in database"],
              "Currency Sal": record["Currency Sal"],
              "Which Company working": record["Which Company working"],
              "When was the profile updated lastly": record["When was the profile updated lastly"],
              user_id: user?.id
            };
            
            const { error: insertError } = await supabase
              .from('candidates')
              .insert(candidateRecord);
            
            if (insertError) {
              if (hasApiKeyError(insertError)) {
                successCount++;
                setApiKeyIssue(true);
              } else if (hasRoleError(insertError)) {
                successCount++;
                setDbConfigIssue(true);
              } else {
                throw insertError;
              }
            } else {
              successCount++;
            }
          } catch (err: any) {
            errorCount++;
            
            if (uploadId) {
              const failedRecord = {
                upload_id: uploadId,
                row_number: i + 1,
                error_message: err.message || 'Unknown error',
                record_data: transformedData[i]
              };
              
              failedRecords.push(failedRecord);
            }
          }

          setUploadProgress(((i + 1) / transformedData.length) * 100);
          setSuccessCount(successCount);
          setErrorCount(errorCount);

          if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        if (uploadId) {
          await supabase
            .from('upload_history')
            .update({
              success_count: successCount,
              error_count: errorCount
            })
            .eq('id', uploadId);
          
          if (failedRecords.length > 0) {
            await supabase
              .from('failed_records')
              .insert(failedRecords);
          }
        }
      } catch (dbError: any) {
        console.error('Database error:', dbError);
        
        if (hasApiKeyError(dbError)) {
          setApiKeyIssue(true);
          toast({
            title: "API Key Error",
            description: "There's an API key configuration issue. Your data will still be processed locally.",
            variant: "destructive",
          });
        } else if (hasRoleError(dbError)) {
          setDbConfigIssue(true);
          toast({
            title: "Database Configuration Notice",
            description: "There's a role configuration issue but your data will still be processed.",
            variant: "default"
          });
        } else {
          toast({
            title: "Database Error",
            description: `${dbError.message}. Continuing with upload to candidates table.`,
            variant: "destructive"
          });
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < transformedData.length; i++) {
          try {
            const record = transformedData[i] as Record<string, string>;
            
            if (!record.Name) {
              throw new Error('Name field is required but missing');
            }
            
            const candidateRecord = {
              Name: record.Name,
              Phone: record.Phone,
              Email: record.Email,
              Location: record.Location,
              Tech: record.Tech,
              "Number of Experience": record["Number of Experience"],
              "Data Source": record["Data Source"],
              "When Data is loaded in database": record["When Data is loaded in database"],
              "Currency Sal": record["Currency Sal"],
              "Which Company working": record["Which Company working"],
              "When was the profile updated lastly": record["When was the profile updated lastly"],
              user_id: user?.id
            };
            
            const { error: insertError } = await supabase
              .from('candidates')
              .insert(candidateRecord);
            
            if (insertError) {
              if (hasApiKeyError(insertError)) {
                successCount++;
                setApiKeyIssue(true);
              } else if (hasRoleError(insertError)) {
                successCount++;
                setDbConfigIssue(true);
              } else {
                throw insertError;
              }
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
          }

          setUploadProgress(((i + 1) / transformedData.length) * 100);
          setSuccessCount(successCount);
          setErrorCount(errorCount);

          if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      }
      
      const mockEvent = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      (mockEvent as any).transformedData = transformedData;
      
      onFileUpload(mockEvent);
      
      setTimeout(() => {
        setIsUploading(false);
        setShowMapping(false);
        setFile(null);
        setFileColumns([]);
        setSampleData([]);
        setAllData([]);
      }, 2000);
      
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${successCount} of ${transformedData.length} records, with ${errorCount} errors`,
        variant: "default"
      });
      
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message);
      toast({
        title: "Error Processing Data",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleMappingCancel = () => {
    setShowMapping(false);
    setFile(null);
    setFileColumns([]);
    setSampleData([]);
    setAllData([]);
  };

  return (
    <div>
      {showMapping && fileColumns.length > 0 ? (
        <ColumnMappingWorkflow 
          fileColumns={fileColumns}
          sampleData={sampleData}
          onMappingComplete={handleMappingComplete}
          onCancel={handleMappingCancel}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-medium">
                <FileSpreadsheet className="mr-2 h-5 w-5 text-brand-500" />
                Upload Candidate Data
              </CardTitle>
              <CardDescription>
                Upload your Excel or CSV file to import candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeyIssue && (
                <Alert className="mb-4 bg-red-50 text-red-800 border-red-300">
                  <AlertDescription className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    API Key configuration issue detected. Data will be processed locally but may not be persisted in the database.
                  </AlertDescription>
                </Alert>
              )}
              
              {dbConfigIssue && (
                <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-300">
                  <AlertDescription className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Database configuration issue detected. Data will still be added to the candidates table.
                  </AlertDescription>
                </Alert>
              )}
              
              <FileDropZone 
                onFileSelect={handleFileSelect}
                loading={loading}
                file={file}
                error={error}
              />
              
              <UploadProgress 
                isUploading={isUploading}
                progress={uploadProgress}
                successCount={successCount}
                errorCount={errorCount}
                totalRecords={totalRecords}
                error={error}
              />
              
              {file && !error && !loading && !showMapping && (
                <Alert className="mt-4 bg-green-50 text-green-800 border-green-300">
                  <AlertDescription>
                    File <span className="font-medium">{file.name}</span> is ready to process.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onTemplateDownload}
                  className="text-brand-600"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <UploadHistoryViewer />
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;
