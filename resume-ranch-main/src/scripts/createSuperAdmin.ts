
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const createSuperAdmin = async () => {
  try {
    console.log('Creating super admin user...');
    
    // First check if the user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('full_name', 'Sudaroli Murugan');
    
    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      throw checkError;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('Super admin profile already exists:', existingUsers[0]);
      return { message: 'Super admin user already exists' };
    }

    // Also check if the user exists in auth system
    console.log('Checking if user exists in auth system...');
    
    try {
      // User doesn't exist, create them
      const response = await supabase.functions.invoke('manage-roles', {
        body: {
          action: 'create_user',
          data: {
            email: 'Sudaroli.Murugan@argentjobs.in',
            password: 'Stonecold*123',
            metadata: {
              full_name: 'Sudaroli Murugan',
              phone: '9620988994'
            },
            role: 'super_admin' // This is the correct format that matches our user_roles table
          }
        }
      });
      
      // Log the full response to debug
      console.log('Function response:', response);
      
      // Special case: if the user already exists, the function will return a 200 with a message
      if (response.data?.message?.includes('already been registered')) {
        console.log('User already exists in auth system');
        return { message: 'Super admin user already exists' };
      }
      
      if (response.error) {
        console.error('Error invoking manage-roles function:', response.error);
        throw response.error;
      }
      
      if (response.data?.error) {
        console.error('Error in manage-roles function response:', response.data.error);
        throw new Error(response.data.error);
      }
      
      console.log('Super admin user created successfully:', response.data);
      return { message: 'Super admin user created successfully' };
    } catch (error) {
      console.error('Error calling manage-roles function:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating super admin user:', error);
    throw error;
  }
};

export default createSuperAdmin;
