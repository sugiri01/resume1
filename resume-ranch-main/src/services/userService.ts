
import { supabase } from '@/integrations/supabase/client';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: string;
  phone?: string;
  location?: string;
  department?: string;
  bio?: string;
  joinDate?: string;
}

export async function fetchUsers() {
  try {
    // Fetch profiles from the profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      throw profilesError;
    }
    
    // Fetch user data from the auth service via the edge function
    const { data: authResponse, error: functionError } = await supabase.functions
      .invoke('manage-roles', {
        body: { action: 'get_users' }
      });
    
    if (functionError) {
      throw functionError;
    }
    
    if (!profilesData || !authResponse?.data?.users) {
      return [];
    }
    
    // Combine the profile data with the auth data
    const authUsers = authResponse.data.users;
    
    const formattedUsers = profilesData.map(profile => {
      const authUser = authUsers.find((u: any) => u.id === profile.id);
      
      const userRole = authUser?.user_metadata?.role || 'user';
      
      return {
        id: profile.id,
        name: profile.full_name || 'Unknown',
        email: authUser?.email || 'Unknown Email',
        role: userRole,
        lastLogin: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleDateString() : 'Never',
        phone: authUser?.user_metadata?.phone || '',
        location: authUser?.user_metadata?.location || '',
        department: authUser?.user_metadata?.department || '',
        bio: authUser?.user_metadata?.bio || '',
        joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'
      };
    });
    
    return formattedUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function addUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  location?: string;
  department?: string;
  bio?: string;
}) {
  try {
    const response = await supabase.functions.invoke('manage-roles', {
      body: {
        action: 'create_user',
        data: {
          email: userData.email,
          password: userData.password,
          metadata: {
            full_name: userData.name,
            phone: userData.phone,
            location: userData.location,
            department: userData.department,
            bio: userData.bio
          },
          role: userData.role
        }
      }
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Error creating user');
    }
    
    if (response.data?.error) {
      throw new Error(response.data.error);
    }
    
    return response.data?.user;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

export async function updateUser(userData: UserData) {
  try {
    const { data, error } = await supabase.functions.invoke('manage-roles', {
      body: {
        action: 'update_user',
        data: {
          id: userData.id,
          updates: {
            user_metadata: {
              full_name: userData.name,
              phone: userData.phone,
              location: userData.location,
              department: userData.department,
              bio: userData.bio,
              role: userData.role
            }
          }
        }
      }
    });
    
    if (error || data?.error) {
      throw error || new Error(data?.error);
    }
    
    // Update the profile record as well
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: userData.name })
      .eq('id', userData.id);
    
    if (profileError) {
      throw profileError;
    }
    
    return userData;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    const { data, error } = await supabase.functions.invoke('manage-roles', {
      body: {
        action: 'delete_user',
        data: { id }
      }
    });
    
    if (error || data?.error) {
      throw error || new Error(data?.error);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Fetch available user roles from the database
export async function fetchUserRoles() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description || ''
    }));
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
}
