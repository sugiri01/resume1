
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, hasRoleError } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  userRole: string;
  loading: boolean;
  hasRoleIssue: boolean;
  signOut: () => Promise<void>;
  updateUserRole: (newRole: string) => void;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  userRole: 'user',
  loading: true,
  hasRoleIssue: false,
  signOut: async () => {},
  updateUserRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [hasRoleIssue, setHasRoleIssue] = useState(false);
  const { toast } = useToast();

  // Function to normalize role naming to ensure consistency
  const normalizeRoleName = (role: string): string => {
    if (typeof role !== 'string') return 'user';
    
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('super') && roleLower.includes('admin')) {
      return 'super_admin';
    } else if (roleLower === 'admin') {
      return 'admin';
    } else {
      return 'user';
    }
  };
  
  // Listen for role-related error events
  useEffect(() => {
    const handleRoleError = (e: Event) => {
      const customEvent = e as CustomEvent;
      setHasRoleIssue(true);
      console.warn('Role error detected in AuthContext:', customEvent.detail?.message);
      
      toast({
        title: "Database Role Issue",
        description: "Using local roles due to database configuration issue.",
        variant: "destructive"
      });
    };
    
    document.addEventListener('supabase-role-error', handleRoleError);
    
    return () => {
      document.removeEventListener('supabase-role-error', handleRoleError);
    };
  }, [toast]);

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Extract user role from metadata 
        const role = newSession?.user?.user_metadata?.role || 'user';
        
        // Normalize role naming to ensure consistency
        const normalizedRole = normalizeRoleName(role);
        
        setUserRole(normalizedRole);
        console.log('Auth state changed. New role:', normalizedRole);
        
        setLoading(false);
      }
    );

    // Then check for an existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check for a saved demo role first
      const savedRole = localStorage.getItem('demo_user_role');
      
      if (savedRole) {
        const normalizedSavedRole = normalizeRoleName(savedRole);
        setUserRole(normalizedSavedRole);
        console.log('Using saved demo role from localStorage:', normalizedSavedRole);
      } else {
        // Extract user role from metadata if no saved role
        const role = currentSession?.user?.user_metadata?.role || 'user';
        const normalizedRole = normalizeRoleName(role);
        setUserRole(normalizedRole);
        console.log('Initial auth check. Current role:', normalizedRole);
      }
      
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      
      if (hasRoleError(error)) {
        setHasRoleIssue(true);
        toast({
          title: "Database Role Issue",
          description: "Using local roles due to database configuration issue.",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear demo role when signing out
    localStorage.removeItem('demo_user_role');
  };

  // Add method to update user role (for demo purposes)
  const updateUserRole = (newRole: string) => {
    const normalizedRole = normalizeRoleName(newRole);
    setUserRole(normalizedRole);
    console.log('Role manually updated to:', normalizedRole);
    
    // Save to localStorage for persistence across page refreshes
    localStorage.setItem('demo_user_role', normalizedRole);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Loading...</h2>
          <Progress value={50} className="w-full" />
          <p className="text-center text-gray-500">Checking authentication status</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      loading, 
      hasRoleIssue, 
      signOut, 
      updateUserRole 
    }}>
      {hasRoleIssue && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Database role configuration issue detected. Using local role management.
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
