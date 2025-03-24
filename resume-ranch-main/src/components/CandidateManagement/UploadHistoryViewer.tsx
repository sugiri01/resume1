
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, FileX, Info, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, hasApiKeyError, hasRoleError } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadRecord {
  id: string;
  filename: string;
  upload_date: string;
  total_records: number;
  success_count: number;
  error_count: number;
  user_id?: string;
}

const UploadHistoryViewer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<UploadRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUploadHistory();
  }, [user]);

  const fetchUploadHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('upload_history')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error fetching upload history:', error);
        
        // Special handling for API key errors
        if (hasApiKeyError(error)) {
          setError('API key configuration issue. Please check your connection settings.');
          toast({
            title: "API Key Error",
            description: "There's an API key configuration issue. Please contact support.",
            variant: "destructive",
          });
        }
        // Special handling for PostgreSQL role errors
        else if (hasRoleError(error)) {
          setError('Database role configuration issue. Upload history will be stored but may not be visible right now.');
          toast({
            title: "Database Configuration Notice",
            description: "The system is experiencing a role configuration issue. Your uploads will still be processed and stored.",
            variant: "default",
          });
        } else {
          setError(`Could not load upload history. ${error.message}`);
          toast({
            title: "Error Loading History",
            description: `Could not load upload history. ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        setHistory(data || []);
      }
    } catch (err: any) {
      console.error('Exception fetching upload history:', err);
      setError(`Could not load upload history. ${err.message}`);
      toast({
        title: "Error Loading History",
        description: `Could not load upload history. ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-medium">
          <FileSpreadsheet className="mr-2 h-5 w-5 text-brand-500" />
          Upload History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
            <span className="ml-2">Loading upload history...</span>
          </div>
        ) : error ? (
          <Alert className="bg-amber-50 text-amber-800 border-amber-300">
            <AlertDescription className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </AlertDescription>
          </Alert>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileX className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No upload history available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Filename</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Success</th>
                  <th className="px-4 py-2 text-right">Errors</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{record.filename}</td>
                    <td className="px-4 py-3">{formatDate(record.upload_date)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{record.success_count}</td>
                    <td className="px-4 py-3 text-right text-red-600">{record.error_count}</td>
                    <td className="px-4 py-3 text-right">{record.total_records}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadHistoryViewer;
