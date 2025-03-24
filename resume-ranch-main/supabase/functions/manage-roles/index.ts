
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Create a Supabase client with the service role key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { action, data } = await req.json()
    
    let result
    
    switch (action) {
      case 'get_users':
        // Use admin.listUsers() to get users from the auth API
        result = await supabase.auth.admin.listUsers()
        break
        
      case 'create_user':
        const { email, password, metadata, role } = data
        
        // Basic validation
        if (!email || !password) {
          console.error('Email and password are required')
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { 
              status: 400, 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          )
        }
        
        try {
          // Check if user already exists
          const { data: existingUser, error: existingUserError } = await supabase.auth.admin.listUsers({
            filters: {
              email: email
            }
          });
          
          if (existingUserError) {
            console.error('Error checking existing user:', existingUserError);
          }
          
          if (existingUser && existingUser.users && existingUser.users.length > 0) {
            console.log('User already exists:', existingUser.users[0])
            return new Response(
              JSON.stringify({ 
                message: 'A user with this email address has already been registered',
                user: existingUser.users[0]
              }),
              { 
                status: 200, 
                headers: { 
                  ...corsHeaders,
                  'Content-Type': 'application/json' 
                } 
              }
            )
          }
          
          // Normalize role to one of the standard valid user roles
          // Only store 'admin', 'user', or 'super_admin' in user metadata
          let normalizedRole = 'user';
          if (role) {
            const lowerRole = role.toLowerCase();
            if (lowerRole.includes('super') && lowerRole.includes('admin')) {
              normalizedRole = 'super_admin';
            } else if (lowerRole === 'admin') {
              normalizedRole = 'admin';
            }
          }
          
          console.log('Creating user with data:', { 
            email, 
            role: normalizedRole, 
            metadata: { ...metadata, full_name: metadata?.full_name } 
          });
          
          // Create user in auth.users
          const createUserResult = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              ...metadata || {},
              role: normalizedRole,
              phone: metadata?.phone,
              location: metadata?.location,
              department: metadata?.department,
              bio: metadata?.bio
            }
          })
          
          if (createUserResult.error) {
            console.error('Error creating user:', createUserResult.error)
            return new Response(
              JSON.stringify({ error: createUserResult.error.message }),
              { 
                status: 400, 
                headers: { 
                  ...corsHeaders,
                  'Content-Type': 'application/json' 
                } 
              }
            )
          }
          
          // The profile should be created automatically by the trigger
          // But we'll ensure it has all the data we need
          if (createUserResult.data.user) {
            console.log('User created successfully, ensuring profile exists')
            
            // Verify profile was created by the trigger
            const { data: existingProfile, error: checkProfileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', createUserResult.data.user.id)
              .single();
              
            if (checkProfileError && checkProfileError.code !== 'PGRST116') {
              console.error('Error checking profile:', checkProfileError);
            }
            
            // If profile doesn't exist, create it
            if (!existingProfile) {
              console.log('Profile not found, creating new profile')
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  id: createUserResult.data.user.id,
                  full_name: metadata?.full_name || '',
                  created_at: new Date().toISOString()
                });
                
              if (profileError) {
                console.error('Error creating profile:', profileError);
                // Continue even if profile creation fails - we'll log it but not fail the request
              } else {
                console.log('Profile created successfully:', profileData)
              }
            } else {
              console.log('Existing profile found:', existingProfile)
            }
          }
          
          result = {
            ...createUserResult,
            message: `User created with role: ${normalizedRole}`
          };
        } catch (err) {
          console.error('Unexpected error creating user:', err)
          return new Response(
            JSON.stringify({ error: `Unexpected error: ${err.message}` }),
            { 
              status: 500, 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          )
        }
        break
        
      case 'update_user':
        const { id, updates } = data
        
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          )
        }
        
        // Normalize role if it's being updated
        if (updates && updates.user_metadata && updates.user_metadata.role) {
          const lowerRole = updates.user_metadata.role.toLowerCase();
          if (lowerRole.includes('super') && lowerRole.includes('admin')) {
            updates.user_metadata.role = 'super_admin';
          } else if (lowerRole === 'admin') {
            updates.user_metadata.role = 'admin';
          } else {
            updates.user_metadata.role = 'user';
          }
        }
        
        result = await supabase.auth.admin.updateUserById(id, updates)
        break
        
      case 'delete_user':
        if (!data.id) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          )
        }
        
        result = await supabase.auth.admin.deleteUser(data.id)
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        )
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in manage-roles function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
