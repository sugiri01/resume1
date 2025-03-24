
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchUsers, addUser, updateUser, deleteUser, UserData } from '@/services/userService';
import { hasRoleError, getFriendlyErrorMessage } from '@/integrations/supabase/client';

export function useUserManagement() {
  const { toast } = useToast();
  const { user: authUser, hasRoleIssue } = useAuth();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState(0);
  
  // State for form data
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    location: '',
    department: '',
    bio: ''
  });
  
  // State for user interactions
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Load users from the database
  const loadUsers = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      setProgressStatus(30);
      
      const usersData = await fetchUsers();
      setUsers(usersData);
      setProgressStatus(100);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setLoadError(getFriendlyErrorMessage(error));
      
      if (hasRoleError(error)) {
        toast({
          title: "Database Role Issue",
          description: "Role configuration issue detected. Some functionality may be limited.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Loading Users",
          description: getFriendlyErrorMessage(error),
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a new user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setFormError('Please fill out all required fields.');
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newUser.email)) {
      setFormError('Please enter a valid email address.');
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (newUser.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setActionLoading(true);
      setFormError(null);
      setProgressStatus(20);
      
      const createdUser = await addUser(newUser);
      
      if (createdUser) {
        const newUserData: UserData = {
          id: createdUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          lastLogin: 'Never',
          phone: newUser.phone,
          location: newUser.location,
          department: newUser.department,
          bio: newUser.bio,
          joinDate: new Date().toLocaleDateString()
        };
        
        setUsers([...users, newUserData]);
        
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'user',
          phone: '',
          location: '',
          department: '',
          bio: ''
        });
        
        setProgressStatus(100);
        
        toast({
          title: "User Added",
          description: "The new user has been added successfully.",
          variant: "default"
        });
      }
    } catch (error: any) {
      setProgressStatus(0);
      console.error('Error adding user:', error);
      setFormError(error.message || 'Could not create user in the database.');
      toast({
        title: "Error Creating User",
        description: error.message || "Could not create user in the database.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle editing a user
  const handleEditUser = async () => {
    if (!editingUser) return;
    
    try {
      setActionLoading(true);
      setProgressStatus(20);
      
      await updateUser(editingUser);
      
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? editingUser : user
      );
      
      setUsers(updatedUsers);
      setDialogOpen(false);
      setProgressStatus(100);
      
      toast({
        title: "User Updated",
        description: "The user information has been updated.",
        variant: "default"
      });
    } catch (error: any) {
      setProgressStatus(0);
      console.error('Error updating user:', error);
      toast({
        title: "Error Updating User",
        description: error.message || "Could not update user in the database.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle deleting a user
  const handleDeleteUser = async (id: string) => {
    try {
      setActionLoading(true);
      setProgressStatus(30);
      
      await deleteUser(id);
      
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      setProgressStatus(100);
      
      toast({
        title: "User Deleted",
        description: "The user has been removed from the system.",
        variant: "default"
      });
    } catch (error: any) {
      setProgressStatus(0);
      console.error('Error deleting user:', error);
      toast({
        title: "Error Deleting User",
        description: error.message || "Could not delete user from the database.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle user detail view
  const handleUserNameClick = (user: UserData) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };
  
  // Handle opening edit dialog
  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setDialogOpen(true);
  };
  
  // Handle role change
  const handleRoleChange = (role: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, role });
    } else {
      setNewUser({ ...newUser, role });
    }
  };
  
  // Handle input change for new user form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormError(null);
    setNewUser({...newUser, [field]: e.target.value});
  };
  
  // Load users on component mount
  useEffect(() => {
    loadUsers();
    
    const handleRoleError = () => {
      setLoadError('Database role configuration issue. Some features may be limited.');
    };
    
    document.addEventListener('supabase-role-error', handleRoleError);
    
    return () => {
      document.removeEventListener('supabase-role-error', handleRoleError);
    };
  }, []);
  
  return {
    users,
    loading,
    actionLoading,
    loadError,
    progressStatus,
    newUser,
    selectedUser,
    userDetailOpen,
    editingUser,
    dialogOpen,
    formError,
    setUserDetailOpen,
    setDialogOpen,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleUserNameClick,
    handleEditClick,
    handleRoleChange,
    handleInputChange,
    setEditingUser,
    refreshUsers: loadUsers
  };
}
