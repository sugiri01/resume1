
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EXPECTED_COLUMNS, areRequiredFieldsMapped } from '@/utils/mappingUtils';
import { analyzeColumnsWithGemini } from '@/utils/geminiService';
import { RotateCw, AlertTriangle, CheckCircle, InfoIcon } from 'lucide-react';
import '../../ExcelMapping.css';

interface ColumnMappingWorkflowProps {
  fileColumns: string[];
  sampleData: any[][];
  onMappingComplete: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

const ColumnMappingWorkflow: React.FC<ColumnMappingWorkflowProps> = ({
  fileColumns,
  sampleData,
  onMappingComplete,
  onCancel
}) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMapping, setAiMapping] = useState<Record<string, string>>({});
  const [userMapping, setUserMapping] = useState<Record<string, string>>({});
  
  // Filter out auto-populate columns that don't need mapping
  const columnsForMapping = EXPECTED_COLUMNS.filter(col => !col.autoPopulate);
  
  // Analyze columns with Gemini when component mounts
  useEffect(() => {
    if (fileColumns.length > 0 && sampleData.length > 0) {
      analyzeColumnsWithGeminiAI();
    }
  }, [fileColumns, sampleData]);

  // Analyze columns with Gemini AI
  const analyzeColumnsWithGeminiAI = async () => {
    if (fileColumns.length === 0 || sampleData.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeColumnsWithGemini(fileColumns, sampleData, columnsForMapping);
      
      if (result.success && result.mappings) {
        // Filter out null values and create a clean mapping
        const validMappings: Record<string, string> = {};
        Object.entries(result.mappings).forEach(([key, value]) => {
          if (value) validMappings[key] = value;
        });
        
        setAiMapping(validMappings);
        setUserMapping(validMappings);
        setStep(1);
      } else {
        setError(result.error || "Failed to analyze columns with AI. Please try mapping manually.");
        // Still proceed to mapping step so user can map manually
        setStep(1);
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred during analysis");
      // Still proceed to mapping step so user can map manually
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Update user mapping when selections change
  const handleMappingChange = (column: string, value: string) => {
    setUserMapping(prev => ({
      ...prev,
      [column]: value || "do-not-import"
    }));
  };

  // Proceed to review step
  const proceedToReview = () => {
    setStep(2);
  };

  // Complete the mapping process
  const completeMapping = () => {
    onMappingComplete(userMapping);
  };

  // Check if all required fields are mapped
  const canProceed = areRequiredFieldsMapped(userMapping);

  return (
    <div className="mapping-container">
      <div className="step-indicator">
        <div className={`mapping-step ${step >= 0 ? 'active' : ''}`}>Upload</div>
        <div className={`mapping-step ${step >= 1 ? 'active' : ''}`}>Map Columns</div>
        <div className={`mapping-step ${step >= 2 ? 'active' : ''}`}>Review</div>
        <div className={`mapping-step ${step >= 3 ? 'active' : ''}`}>Complete</div>
      </div>

      {step === 0 && (
        <div className="mapping-step-container">
          <h2 className="text-xl font-semibold mb-4">Analyzing Your Data</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              <p>Analyzing your file with AI to suggest column mappings...</p>
            </div>
          ) : error ? (
            <div>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex space-x-3 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={analyzeColumnsWithGeminiAI}
                  disabled={loading}
                >
                  {loading ? (
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : "Try Again"}
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setStep(1)}
                >
                  Continue to Manual Mapping
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onCancel} 
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p>Starting analysis...</p>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="mapping-step-container">
          <h2 className="text-xl font-semibold mb-2">Column Mapping</h2>
          <p>
            {error 
              ? "AI analysis failed. Please map your columns manually." 
              : "Our AI has analyzed your data and suggested mappings. Please review and adjust if needed."}
          </p>
          
          <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-300">
            <InfoIcon className="h-4 w-4 mr-2" />
            <AlertDescription>
              <b>Note:</b> Some fields like "Last Profile Update", "Database Upload Date", and "Source of Data" will be automatically populated and do not need to be mapped.
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Table className="mapping-table">
            <TableHeader>
              <TableRow>
                <TableHead>Your Excel Column</TableHead>
                <TableHead>Sample Data</TableHead>
                <TableHead>Map To Field</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fileColumns.map((col, idx) => (
                <TableRow key={idx}>
                  <TableCell>{col}</TableCell>
                  <TableCell className="sample-data">
                    {sampleData.slice(0, 2).map((row, rowIdx) => (
                      <div key={rowIdx}>{row[idx]?.toString().substring(0, 25) || ''}</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={userMapping[col] || "do-not-import"}
                      onValueChange={(value) => handleMappingChange(col, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Do not import" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="do-not-import">Do not import</SelectItem>
                        {columnsForMapping.map(expectedCol => (
                          <SelectItem key={expectedCol.id} value={expectedCol.id}>
                            {expectedCol.label}{expectedCol.required ? ' *' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="action-buttons mt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={proceedToReview}
              disabled={!canProceed}
            >
              Proceed to Review
            </Button>
          </div>
          
          {!canProceed && (
            <Alert className="mt-4 bg-yellow-50 text-yellow-800 border-yellow-300">
              <AlertDescription>
                Please map all required fields before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="mapping-step-container">
          <h2 className="text-xl font-semibold mb-2">Review Mapping</h2>
          <p>Please review your column mapping before finalizing the import.</p>
          
          <Table className="review-table">
            <TableHeader>
              <TableRow>
                <TableHead>System Field</TableHead>
                <TableHead>Mapped From</TableHead>
                <TableHead>Sample Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXPECTED_COLUMNS.map(expectedCol => {
                const mappedColumn = Object.entries(userMapping).find(
                  ([_, target]) => target === expectedCol.id
                );
                
                const originalColumn = mappedColumn ? mappedColumn[0] : null;
                const columnIndex = originalColumn 
                  ? fileColumns.findIndex(col => col === originalColumn)
                  : -1;
                
                return (
                  <TableRow key={expectedCol.id}>
                    <TableCell className={expectedCol.required ? 'required' : ''}>
                      {expectedCol.label}
                      {expectedCol.required ? ' *' : ''}
                    </TableCell>
                    <TableCell>
                      {expectedCol.autoPopulate ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Auto-populated
                        </span>
                      ) : originalColumn ? (
                        originalColumn
                      ) : (
                        <span className="not-mapped">Not mapped</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expectedCol.autoPopulate ? (
                        expectedCol.id === 'Data Source' ? (
                          'From filename'
                        ) : (
                          'Current date'
                        )
                      ) : columnIndex >= 0 && sampleData[0] ? 
                        sampleData[0][columnIndex]?.toString().substring(0, 25) : 
                        'No data'
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          <div className="action-buttons mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Mapping
            </Button>
            <Button onClick={completeMapping}>
              Finalize Import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnMappingWorkflow;
