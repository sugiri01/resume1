import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Trash2, Save, Edit, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AnimatedCard from './AnimatedCard';
import TransitionLayout from './TransitionLayout';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Json } from '@/integrations/supabase/types';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

const RoleManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [dbConfigIssue, setDbConfigIssue] = useState(false);

  // Available permissions
  const permissions: Permission[] = [
    { id: 'view_candidates', name: 'View Candidates', description: 'Can view candidate profiles' },
    { id: 'edit_candidates', name: 'Edit Candidates', description: 'Can edit candidate information' },
    { id: 'delete_candidates', name: 'Delete Candidates', description: 'Can delete candidates' },
    { id: 'upload_data', name: 'Upload Data', description: 'Can upload candidate data' },
    { id: 'run_reports', name: 'Run Reports', description: 'Can generate and view reports' },
    { id: 'manage_users', name: 'Manage Users', description: 'Can add, edit, and remove users (Admin only)' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Can add, edit, and remove roles (Super Admin only)' }
  ];

  // New role state
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Editing state
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<string | null>(null);

  // Default roles to display when DB has issues
  const getDefaultRoles = (): Role[] => {
    return [
      {
        id: 'default-super-admin',
        name: 'super_admin',
        description: 'Super Administrator with all permissions',
        permissions: permissions.map(p => p.id)
      },
      {
        id: 'default-admin',
        name: 'admin',
        description: 'Administrator with elevated permissions',
        permissions: ['view_candidates', 'edit_candidates', 'delete_candidates', 'upload_data', 'run_reports', 'manage_users']
      },
      {
        id: 'default-user',
        name: 'user',
        description: 'Basic user with limited permissions',
        permissions: ['view_candidates']
      }
    ];
  };

  // Load roles from Supabase
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setDbConfigIssue(false);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching roles:', error);
          
          // Handle role-related errors
          if (error.message.includes('role') && error.message.includes('does not exist')) {
            setDbConfigIssue(true);
            toast({
              title: "Database Configuration Notice",
              description: "Role configuration issue detected. Using default roles temporarily.",
              variant: "default"
            });
            setRoles(getDefaultRoles());
          } else {
            toast({
              title: "Error Loading Roles",
              description: "Could not load roles from the database. Using default roles.",
              variant: "destructive"
            });
            setRoles(getDefaultRoles());
          }
        } else if (data && data.length > 0) {
          const formattedRoles = data.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description || '',
            permissions: Array.isArray(role.permissions) 
              ? role.permissions.map(p => String(p)) 
              : typeof role.permissions === 'object' 
                ? Object.values(role.permissions).map(p => String(p)) 
                : []
          }));
          setRoles(formattedRoles);
        } else {
          // If no roles are found in the database, use default roles
          setRoles(getDefaultRoles());
        }
      } catch (error) {
        console.error('Error in fetchRoles:', error);
        setRoles(getDefaultRoles());
        toast({
          title: "Error Loading Roles",
          description: "Could not load roles from the database. Using default roles.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [toast]);

  const handleAddRole = async () => {
    if (!newRole.name) {
      toast({
        title: "Missing Name",
        description: "Please provide a name for the role.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // For DB config issues, just add to local state
      if (dbConfigIssue) {
        const newRoleWithId: Role = {
          id: `local-${Date.now()}`,
          name: newRole.name,
          description: newRole.description,
          permissions: [...newRole.permissions]
        };
        
        setRoles([...roles, newRoleWithId]);
        
        setNewRole({
          name: '',
          description: '',
          permissions: []
        });
        
        toast({
          title: "Role Added Locally",
          description: `The role "${newRole.name}" has been added locally due to database configuration issues.`,
          variant: "default"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions
        })
        .select()
        .single();

      if (error) {
        // Special handling for role-related errors
        if (error.message.includes('role') && error.message.includes('does not exist')) {
          setDbConfigIssue(true);
          
          // Add role locally
          const newRoleWithId: Role = {
            id: `local-${Date.now()}`,
            name: newRole.name,
            description: newRole.description,
            permissions: [...newRole.permissions]
          };
          
          setRoles([...roles, newRoleWithId]);
          
          toast({
            title: "Role Added Locally",
            description: `The role "${newRole.name}" has been added to the UI. Database changes will be applied when the issue is resolved.`,
            variant: "default"
          });
        } else {
          throw error;
        }
      } else if (data) {
        const role: Role = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          permissions: Array.isArray(data.permissions) 
            ? data.permissions.map(p => String(p)) 
            : []
        };

        setRoles([...roles, role]);
        
        toast({
          title: "Role Added",
          description: `The role "${role.name}" has been added successfully.`,
          variant: "default"
        });
      }
      
      setNewRole({
        name: '',
        description: '',
        permissions: []
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: "Error Adding Role",
        description: "Could not add the role to the database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setEditedRole({ ...role });
  };

  const handleSaveEdit = async () => {
    if (!editedRole) return;

    try {
      setLoading(true);
      
      // For DB config issues, just update local state
      if (dbConfigIssue || editedRole.id.startsWith('local-')) {
        const updatedRoles = roles.map(role => 
          role.id === editingRoleId ? editedRole : role
        );
        
        setRoles(updatedRoles);
        setEditingRoleId(null);
        setEditedRole(null);
        
        toast({
          title: "Role Updated Locally",
          description: "The role has been updated in the UI. Database changes will be applied when the issue is resolved.",
          variant: "default"
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_roles')
        .update({
          name: editedRole.name,
          description: editedRole.description,
          permissions: editedRole.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRoleId);

      if (error) {
        // Special handling for role-related errors
        if (error.message.includes('role') && error.message.includes('does not exist')) {
          setDbConfigIssue(true);
          
          // Update locally
          const updatedRoles = roles.map(role => 
            role.id === editingRoleId ? editedRole : role
          );
          
          setRoles(updatedRoles);
          
          toast({
            title: "Role Updated Locally",
            description: "The role has been updated in the UI. Database changes will be applied when the issue is resolved.",
            variant: "default"
          });
        } else {
          throw error;
        }
      } else {
        const updatedRoles = roles.map(role => 
          role.id === editingRoleId ? editedRole : role
        );
        
        setRoles(updatedRoles);
        
        toast({
          title: "Role Updated",
          description: "The role has been updated successfully.",
          variant: "default"
        });
      }
      
      setEditingRoleId(null);
      setEditedRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error Updating Role",
        description: "Could not update the role in the database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      setLoading(true);
      
      // For DB config issues, just update local state
      if (dbConfigIssue || id.startsWith('local-')) {
        const updatedRoles = roles.filter(role => role.id !== id);
        setRoles(updatedRoles);
        setDeletingRole(null);
        
        toast({
          title: "Role Deleted Locally",
          description: "The role has been removed from the UI. Database changes will be applied when the issue is resolved.",
          variant: "default"
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) {
        // Special handling for role-related errors
        if (error.message.includes('role') && error.message.includes('does not exist')) {
          setDbConfigIssue(true);
          
          // Delete locally
          const updatedRoles = roles.filter(role => role.id !== id);
          setRoles(updatedRoles);
          
          toast({
            title: "Role Deleted Locally",
            description: "The role has been removed from the UI. Database changes will be applied when the issue is resolved.",
            variant: "default"
          });
        } else {
          throw error;
        }
      } else {
        const updatedRoles = roles.filter(role => role.id !== id);
        setRoles(updatedRoles);
        
        toast({
          title: "Role Deleted",
          description: "The role has been deleted successfully.",
          variant: "default"
        });
      }
      
      setDeletingRole(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error Deleting Role",
        description: "Could not delete the role from the database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean, isEditing: boolean) => {
    if (isEditing && editedRole) {
      if (checked) {
        setEditedRole({
          ...editedRole,
          permissions: [...editedRole.permissions, permissionId]
        });
      } else {
        setEditedRole({
          ...editedRole,
          permissions: editedRole.permissions.filter(id => id !== permissionId)
        });
      }
    } else {
      if (checked) {
        setNewRole({
          ...newRole,
          permissions: [...newRole.permissions, permissionId]
        });
      } else {
        setNewRole({
          ...newRole,
          permissions: newRole.permissions.filter(id => id !== permissionId)
        });
      }
    }
  };

  if (loading && roles.length === 0) {
    return (
      <AnimatedCard
        title="Role Management"
        className="max-w-5xl mx-auto"
      >
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <span className="ml-2">Loading roles...</span>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard
      title="Role Management"
      className="max-w-5xl mx-auto"
    >
      <TransitionLayout animationType="fade" delay={100}>
        <div className="space-y-6">
          {dbConfigIssue && (
            <Alert className="bg-amber-50 text-amber-800 border-amber-300">
              <AlertDescription className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Database role configuration issue detected. You can still view and manage roles in the UI,
                but changes may not be saved to the database until the issue is resolved.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Existing Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-brand-50 dark:bg-brand-900/20">
                      <th className="px-4 py-3 text-left font-medium">Role Name</th>
                      <th className="px-4 py-3 text-left font-medium">Description</th>
                      <th className="px-4 py-3 text-left font-medium">Permissions</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-3 font-medium">
                          {editingRoleId === role.id ? (
                            <Input 
                              value={editedRole?.name || ''} 
                              onChange={e => setEditedRole({ ...editedRole!, name: e.target.value })}
                              className="w-full"
                            />
                          ) : (
                            role.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingRoleId === role.id ? (
                            <Input 
                              value={editedRole?.description || ''} 
                              onChange={e => setEditedRole({ ...editedRole!, description: e.target.value })}
                              className="w-full"
                            />
                          ) : (
                            role.description
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingRoleId === role.id ? (
                            <div className="flex flex-wrap gap-2">
                              {permissions.map(permission => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`edit-${role.id}-${permission.id}`}
                                    checked={editedRole?.permissions.includes(permission.id)}
                                    onCheckedChange={checked => 
                                      handlePermissionChange(permission.id, checked === true, true)
                                    }
                                  />
                                  <Label htmlFor={`edit-${role.id}-${permission.id}`} className="text-xs">
                                    {permission.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-x-1">
                              {role.permissions.map(id => {
                                const permission = permissions.find(p => p.id === id);
                                return permission ? (
                                  <span 
                                    key={id} 
                                    className="inline-block px-2 py-1 text-xs rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300 mb-1"
                                  >
                                    {permission.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {editingRoleId === role.id ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={loading}
                              >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRole(role)}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeletingRole(role.id)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteRole(role.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Add New Role */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      placeholder="e.g., Marketing Manager"
                      value={newRole.name}
                      onChange={e => setNewRole({...newRole, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Input
                      id="role-description"
                      placeholder="Describe the role's responsibilities"
                      value={newRole.description}
                      onChange={e => setNewRole({...newRole, description: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {permissions.map(permission => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`permission-${permission.id}`} 
                          checked={newRole.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.id, checked === true, false)
                          }
                        />
                        <div>
                          <Label 
                            htmlFor={`permission-${permission.id}`} 
                            className="cursor-pointer font-medium"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddRole} 
                  className="w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Role...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Add Role
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TransitionLayout>
    </AnimatedCard>
  );
};

export default RoleManagementPage;
