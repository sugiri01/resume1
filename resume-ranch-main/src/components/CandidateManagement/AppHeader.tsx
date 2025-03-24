
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, LogOut, Settings, AlertTriangle } from 'lucide-react';
import SearchBar from './SearchBar';
import { Candidate } from '@/types/candidate';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { hasRoleError, hasApiKeyError } from '@/integrations/supabase/client';

interface AppHeaderProps {
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  onDownload: () => void;
  onSignOut: () => void;
  toggleUserRole?: () => void;
  userRole: string;
  candidates: Candidate[];
}

const AppHeader: React.FC<AppHeaderProps> = ({
  globalSearchTerm,
  setGlobalSearchTerm,
  onDownload,
  onSignOut,
  toggleUserRole,
  userRole,
  candidates
}) => {
  const { toast } = useToast();
  const [hasRoleIssue, setHasRoleIssue] = useState<boolean>(false);
  const [hasApiKeyIssue, setHasApiKeyIssue] = useState<boolean>(false);
  
  // Listen for role-related error events
  useEffect(() => {
    const handleRoleError = () => {
      setHasRoleIssue(true);
    };
    
    const handleApiKeyError = () => {
      setHasApiKeyIssue(true);
    };
    
    document.addEventListener('supabase-role-error', handleRoleError);
    document.addEventListener('supabase-apikey-error', handleApiKeyError);
    
    return () => {
      document.removeEventListener('supabase-role-error', handleRoleError);
      document.removeEventListener('supabase-apikey-error', handleApiKeyError);
    };
  }, []);
  
  // Function to format role display name
  const formatRoleName = (role: string): string => {
    if (!role) return 'User';
    
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('super') && roleLower.includes('admin')) {
      return 'Super Admin';
    } else if (roleLower === 'admin') {
      return 'Admin';
    } else {
      return 'User';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-brand-100 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {(hasRoleIssue || hasApiKeyIssue) && (
          <Alert variant="destructive" className="mb-2 w-full">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {hasRoleIssue 
                ? "Database role configuration issue detected. Some features may have limited functionality." 
                : "API authentication issue. Please check your API keys."}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center w-full md:w-auto">
          <h1 className="text-2xl font-semibold text-brand-800 flex items-center">
            <span>Talent Management</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <SearchBar 
            value={globalSearchTerm} 
            onChange={setGlobalSearchTerm}
            placeholder="Search candidates..."
            className="w-full md:w-64"
          />
          
          {candidates && candidates.length > 0 && (
            <Button 
              onClick={onDownload}
              variant="outline"
              size="sm"
              className="border-brand-200 hover:bg-brand-50 text-brand-700 whitespace-nowrap"
            >
              <Download className="mr-1 h-4 w-4" /> Export
            </Button>
          )}
          
          {/* Toggle role button - only render if toggleUserRole function is provided */}
          {toggleUserRole && (
            <Button 
              onClick={() => {
                toggleUserRole();
                toast({
                  title: "Role Changed",
                  description: `Switched to ${userRole === 'super_admin' ? 'User' : userRole === 'admin' ? 'Super Admin' : 'Admin'} role`,
                  variant: "default"
                });
              }}
              variant={hasRoleIssue ? "destructive" : "outline"}
              size="sm"
              className={hasRoleIssue ? "border-red-200" : "border-brand-200 hover:bg-brand-50 text-brand-700"}
            >
              {hasRoleIssue && <AlertTriangle className="mr-1 h-4 w-4" />}
              Role: {formatRoleName(userRole)}
            </Button>
          )}
          
          <Button 
            onClick={onSignOut}
            variant="outline"
            size="sm"
            className="border-brand-200 hover:bg-brand-50 text-brand-700"
          >
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
