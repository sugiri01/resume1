
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import TransitionLayout from '@/components/CandidateManagement/TransitionLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import createSuperAdmin from '@/scripts/createSuperAdmin';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Super admin creation state
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminCreationError, setAdminCreationError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "You've been logged in successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now login.",
      });
      
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to create the super admin user directly
  const handleCreateSuperAdmin = async () => {
    setCreatingAdmin(true);
    setAdminCreationError(null);
    
    try {
      const result = await createSuperAdmin();
      
      toast({
        title: "Super Admin Created",
        description: result.message || "Sudaroli Murugan has been added as a Super Admin",
      });
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred";
      setAdminCreationError(errorMessage);
      
      toast({
        title: "Failed to create Super Admin",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating super admin:', error);
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center px-4 py-12">
      <TransitionLayout animationType="scale">
        <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-xl rounded-2xl border border-brand-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-800">
              Talent Management System
            </h1>
            <p className="mt-2 text-brand-500">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-brand-700 flex items-center">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-brand-50 border-brand-200"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-brand-700 flex items-center">
                    <Lock className="h-4 w-4 mr-2" /> Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-brand-50 border-brand-200"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              
              {/* Add super admin creation button - for development use */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Development Tools</p>
                <Button
                  onClick={handleCreateSuperAdmin}
                  variant="outline"
                  disabled={creatingAdmin}
                  className="w-full text-sm"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {creatingAdmin ? 'Creating Super Admin...' : 'Create Super Admin (Sudaroli Murugan)'}
                </Button>
                
                {adminCreationError && (
                  <p className="mt-2 text-xs text-red-500">
                    Error: {adminCreationError}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-brand-700 flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" /> Full Name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-brand-50 border-brand-200"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="registerEmail" className="text-sm font-medium text-brand-700 flex items-center">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="bg-brand-50 border-brand-200"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="registerPassword" className="text-sm font-medium text-brand-700 flex items-center">
                    <Lock className="h-4 w-4 mr-2" /> Password
                  </label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="bg-brand-50 border-brand-200"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </TransitionLayout>
    </div>
  );
};

export default Auth;
