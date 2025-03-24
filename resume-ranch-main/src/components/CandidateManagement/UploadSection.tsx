
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Upload, UserPlus } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import { useToast } from '@/hooks/use-toast';

interface Column {
  field: string;
  display: string;
  icon: React.ReactNode;
  type: string;
}

interface UploadSectionProps {
  columns: Column[];
  uploadStatus: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ 
  columns, 
  uploadStatus, 
  onFileUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        // @ts-ignore - Setting files directly
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <div className="space-y-8">
      <AnimatedCard
        title="Upload Candidate Data"
        animationType="fade"
        className="overflow-hidden"
      >
        <div 
          className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all ${
            isDragging 
              ? 'border-brand-500 bg-brand-50' 
              : 'border-brand-200 hover:border-brand-300 bg-white/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-6">
            <UserPlus size={32} className="text-brand-500" />
          </div>
          
          <h3 className="text-xl font-medium text-brand-800 mb-2">
            {isDragging ? 'Drop your file here' : 'Drag and drop or select a file'}
          </h3>
          <p className="text-brand-500 mb-6 text-center max-w-md">
            Upload your candidate data in supported formats: .xlsx, .xls, or .csv
          </p>
          
          <input
            type="file"
            id="fileUpload"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            onChange={onFileUpload}
            className="hidden"
          />
          
          <Button 
            onClick={handleClick}
            className="bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Select File
              </>
            )}
          </Button>
          
          {uploadStatus && (
            <p className={`mt-6 ${
              uploadStatus.includes('Success') 
                ? 'text-green-600' 
                : 'text-red-500'
            }`}>
              {uploadStatus}
            </p>
          )}
        </div>
      </AnimatedCard>

      <AnimatedCard
        title="Expected Column Headers"
        animationType="fade"
        animationDelay={300}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
          {columns.map((col) => (
            <div key={col.field} className="flex items-center space-x-2 text-sm hover:bg-brand-50 p-2 rounded-md transition-all">
              <div className="text-brand-500">
                {col.icon}
              </div>
              <span className="text-brand-700 font-medium">{col.display}</span>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default UploadSection;
