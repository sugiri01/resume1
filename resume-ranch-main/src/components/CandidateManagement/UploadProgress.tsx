
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
  successCount: number;
  errorCount: number;
  totalRecords: number;
  error: string | null;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  progress,
  successCount,
  errorCount,
  totalRecords,
  error
}) => {
  if (!isUploading && !error && successCount === 0 && errorCount === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {isUploading && (
        <>
          <div className="flex justify-between text-sm font-medium">
            <span>Uploading candidates...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500">
            Processed {successCount + errorCount} of {totalRecords} records
          </p>
        </>
      )}

      {!isUploading && successCount > 0 && (
        <Alert className="bg-green-50 text-green-800 border-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>
            Successfully processed {successCount} of {totalRecords} records
            {errorCount > 0 ? `, with ${errorCount} errors` : ''}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UploadProgress;
