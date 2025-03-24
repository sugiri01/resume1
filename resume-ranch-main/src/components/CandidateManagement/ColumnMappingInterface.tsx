
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, RefreshCw, XCircle, Edit, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TransitionLayout from './TransitionLayout';

interface ColumnMappingInterfaceProps {
  columns: { field: string, display: string, icon: JSX.Element, type: string }[];
  fileColumns: string[];
  sampleData: any[][];
  onMappingComplete: (mapping: Record<string, string>) => void;
  onBack: () => void;
}

const ColumnMappingInterface: React.FC<ColumnMappingInterfaceProps> = ({
  columns,
  fileColumns,
  sampleData,
  onMappingComplete,
  onBack
}) => {
  const { toast } = useToast();
  const [userMapping, setUserMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'mapping' | 'review'>('mapping');
  const [autoMatchApplied, setAutoMatchApplied] = useState(false);
  
  const requiredFields = columns
    .filter(col => ['Name', 'Email', 'Phone'].includes(col.field))
    .map(col => col.field);

  const autoPopulatedFields = [
    'When Data is loaded in database',
    'When was the profile updated lastly',
    'Data Source'
  ];

  const columnsForMapping = columns.filter(col => !autoPopulatedFields.includes(col.field));

  useEffect(() => {
    if (fileColumns.length > 0 && !autoMatchApplied) {
      applyAutoMatching();
    }
  }, [fileColumns]);

  const columnDisplayMap = Object.fromEntries(
    columns.map(col => [col.field, col])
  );

  const applyAutoMatching = () => {
    const newMapping: Record<string, string> = {};
    
    fileColumns.forEach(excelCol => {
      const normalizedExcelCol = excelCol.toLowerCase().replace(/[_\s-]/g, '');
      
      for (const sysCol of columnsForMapping) {
        const normalizedSysCol = sysCol.display.toLowerCase().replace(/[_\s-]/g, '');
        const normalizedField = sysCol.field.toLowerCase().replace(/[_\s-]/g, '');
        
        if (
          normalizedExcelCol.includes(normalizedSysCol) || 
          normalizedSysCol.includes(normalizedExcelCol) ||
          normalizedExcelCol.includes(normalizedField) || 
          normalizedField.includes(normalizedExcelCol)
        ) {
          newMapping[excelCol] = sysCol.field;
          break;
        }
      }
    });
    
    setUserMapping(newMapping);
    setAutoMatchApplied(true);
    
    toast({
      title: "Auto-matching applied",
      description: `${Object.keys(newMapping).length} columns were automatically matched based on column names.`,
      variant: "default"
    });
  };

  const handleMappingChange = (column: string, targetField: string) => {
    setUserMapping(prev => ({
      ...prev,
      [column]: targetField === "do-not-import" ? "" : targetField
    }));

    if (targetField && targetField !== "do-not-import") {
      toast({
        title: "Mapping updated",
        description: `"${column}" mapped to "${columnDisplayMap[targetField]?.display || targetField}"`,
        variant: "default",
        duration: 2000
      });
    }
  };

  const canProceed = () => {
    const mappedFields = new Set(Object.values(userMapping).filter(Boolean));
    return requiredFields.every(field => mappedFields.has(field));
  };

  const isRequiredFieldMapped = (field: string) => {
    return requiredFields.includes(field) && 
           !Object.values(userMapping).includes(field);
  };

  const getFieldMappingStatus = (field: string) => {
    const isMapped = Object.values(userMapping).includes(field);
    const isRequired = requiredFields.includes(field);
    
    if (isMapped) return "mapped";
    if (isRequired) return "required";
    return "unmapped";
  };

  const proceedToReview = () => {
    setStep('review');
  };

  const backToMapping = () => {
    setStep('mapping');
  };

  const completeMappingProcess = () => {
    onMappingComplete(userMapping);
  };

  const resetMappings = () => {
    setUserMapping({});
    toast({
      title: "Mappings Reset",
      description: "All column mappings have been cleared.",
      variant: "default"
    });
  };

  const getMappedField = (column: string) => {
    return userMapping[column] || "";
  };

  const getColumnsForField = (field: string) => {
    return Object.entries(userMapping)
      .filter(([_, mappedField]) => mappedField === field)
      .map(([col]) => col);
  };

  const hasDuplicateMappings = () => {
    const mappedFields = Object.values(userMapping).filter(Boolean);
    return mappedFields.length !== new Set(mappedFields).size;
  };

  const isColumnMapped = (column: string) => {
    return !!userMapping[column];
  };

  return (
    <div className="space-y-6">
      {step === 'mapping' && (
        <TransitionLayout animationType="fade" delay={100}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-brand-800">Map Excel Columns</h2>
                <p className="text-brand-500">
                  Map your Excel columns to the corresponding fields in our system
                </p>
              </div>
              
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetMappings}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all current mappings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={applyAutoMatching}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Auto-Match
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Try to match columns automatically by name</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-300">
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>
                <b>Note:</b> "Last Profile Update", "Database Upload Date", and "Source of Data" will be automatically filled and don't need to be mapped.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-md">
              <div className="text-sm font-medium mr-2">Mapping Status:</div>
              {columns.map(sysCol => {
                const isAutoPopulated = autoPopulatedFields.includes(sysCol.field);
                
                if (isAutoPopulated) {
                  return (
                    <TooltipProvider key={sysCol.field}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            className="flex items-center gap-1 cursor-default bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            {sysCol.icon}
                            <span>{sysCol.display}</span>
                            <CheckCircle className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Auto-populated field - doesn't need to be mapped</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
                
                const status = getFieldMappingStatus(sysCol.field);
                const mappedColumns = getColumnsForField(sysCol.field);
                
                return (
                  <TooltipProvider key={sysCol.field}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`flex items-center gap-1 cursor-default ${
                            status === 'mapped' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : status === 'required' 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {sysCol.icon}
                          <span>{sysCol.display}</span>
                          {status === 'mapped' && <CheckCircle className="h-3 w-3" />}
                          {status === 'required' && <AlertTriangle className="h-3 w-3" />}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {status === 'mapped' ? (
                          <p>Mapped from: {mappedColumns.join(', ')}</p>
                        ) : status === 'required' ? (
                          <p>Required field - needs to be mapped</p>
                        ) : (
                          <p>Optional field - not currently mapped</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
            
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Your Excel Column</TableHead>
                    <TableHead className="w-1/3">Sample Data</TableHead>
                    <TableHead className="w-1/3">Map To Field</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileColumns.map((col, idx) => (
                    <TableRow 
                      key={idx}
                      className={isColumnMapped(col) ? "bg-green-50 hover:bg-green-100" : ""}
                    >
                      <TableCell className="font-medium">{col}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {sampleData.slice(0, 2).map((row, rowIdx) => (
                          <div key={rowIdx} className="truncate max-w-64">
                            {row[idx]?.toString().substring(0, 30) || "—"}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={userMapping[col] || "do-not-import"} 
                            onValueChange={(value) => handleMappingChange(col, value)}
                          >
                            <SelectTrigger 
                              className={`w-full ${
                                isColumnMapped(col) ? "border-green-500 bg-green-50" : ""
                              }`}
                            >
                              <SelectValue placeholder="Do not import">
                                {userMapping[col] && columnDisplayMap[userMapping[col]] && (
                                  <div className="flex items-center gap-2">
                                    {columnDisplayMap[userMapping[col]].icon}
                                    <span>{columnDisplayMap[userMapping[col]].display}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="do-not-import">Do not import</SelectItem>
                              {columnsForMapping.map(sysCol => {
                                const isMapped = Object.values(userMapping).includes(sysCol.field);
                                const isRequired = requiredFields.includes(sysCol.field);
                                
                                return (
                                  <SelectItem 
                                    key={sysCol.field} 
                                    value={sysCol.field}
                                    className={`${
                                      isRequired ? "font-semibold" : ""
                                    } ${
                                      isMapped && userMapping[col] !== sysCol.field 
                                        ? "text-gray-400" 
                                        : ""
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      {sysCol.icon}
                                      <span>
                                        {sysCol.display}
                                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                                      </span>
                                      {isMapped && userMapping[col] !== sysCol.field && (
                                        <span className="text-xs text-gray-500">(already mapped)</span>
                                      )}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          
                          {isColumnMapped(col) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-green-600"
                                    onClick={() => handleMappingChange(col, "do-not-import")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Clear this mapping</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {hasDuplicateMappings() && (
              <div className="flex items-center p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">
                  Warning: Some fields are mapped to multiple columns. Only one column will be imported for each field.
                </p>
              </div>
            )}
            
            {!canProceed() && (
              <div className="flex items-center p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Please map all required fields before proceeding:</p>
                  <ul className="text-sm list-disc list-inside mt-1">
                    {requiredFields.map(field => {
                      if (!Object.values(userMapping).includes(field)) {
                        return (
                          <li key={field}>
                            {columnDisplayMap[field]?.display || field}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={proceedToReview}
                disabled={!canProceed()}
              >
                Review Mapping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TransitionLayout>
      )}

      {step === 'review' && (
        <TransitionLayout animationType="fade" delay={100}>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-brand-800">Review Column Mapping</h2>
              <p className="text-brand-500">
                Please review your column mapping before finalizing the import.
              </p>
            </div>
            
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">System Field</TableHead>
                    <TableHead className="w-1/3">Mapped From</TableHead>
                    <TableHead className="w-1/3">Sample Data</TableHead>
                    <TableHead className="w-16">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map(sysCol => {
                    const isAutoPopulated = autoPopulatedFields.includes(sysCol.field);
                    
                    const mappedColumn = Object.entries(userMapping).find(
                      ([_, target]) => target === sysCol.field
                    );
                    
                    const originalColumn = mappedColumn ? mappedColumn[0] : null;
                    const columnIndex = originalColumn 
                      ? fileColumns.findIndex(col => col === originalColumn)
                      : -1;
                    
                    const isRequired = requiredFields.includes(sysCol.field);
                    
                    return (
                      <TableRow 
                        key={sysCol.field}
                        className={isAutoPopulated || originalColumn ? "bg-green-50" : isRequired ? "bg-red-50" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {sysCol.icon}
                            <span>
                              {sysCol.display}
                              {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isAutoPopulated ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Auto-populated
                            </span>
                          ) : originalColumn ? (
                            <span className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {originalColumn}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              {isRequired ? (
                                <span className="text-red-500 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Not mapped (Required)
                                </span>
                              ) : (
                                "Not mapped"
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {isAutoPopulated ? (
                            sysCol.field === 'Data Source' ? (
                              'From filename'
                            ) : (
                              'Current date'
                            )
                          ) : columnIndex >= 0 && sampleData[0] ? (
                            <span className="truncate block max-w-64">
                              {sampleData[0][columnIndex]?.toString().substring(0, 30) || "—"}
                            </span>
                          ) : (
                            "No data"
                          )}
                        </TableCell>
                        <TableCell>
                          {!isAutoPopulated && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={backToMapping}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4 text-brand-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={backToMapping}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Mapping
              </Button>
              <Button
                onClick={completeMappingProcess}
              >
                Finalize Import
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TransitionLayout>
      )}
    </div>
  );
};

export default ColumnMappingInterface;
