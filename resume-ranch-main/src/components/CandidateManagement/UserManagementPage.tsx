
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import AnimatedCard from './AnimatedCard';
import TransitionLayout from './TransitionLayout';
import UserFormSection from './UserManagement/UserFormSection';
import UserEditDialog from './UserManagement/UserEditDialog';
import UserListSection from './UserManagement/UserListSection';
import UserDetailDialog from './UserManagement/UserDetailDialog';
import { useUserManagement } from '@/hooks/useUserManagement';

const UserManagementPage: React.FC<{userRole?: string}> = ({ userRole = 'admin' }) => {
  const { user: authUser, hasRoleIssue } = useAuth();
  const isSuperAdmin = userRole === 'super_admin';
  
  const {
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
    setEditingUser
  } = useUserManagement();

  if (loading && users.length === 0) {
    return (
      <AnimatedCard
        title="User Management"
        className="max-w-6xl mx-auto"
      >
        <div className="space-y-4">
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500 mr-2" />
            <span>Loading users...</span>
          </div>
          <Progress value={progressStatus} className="w-full h-2" />
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard
      title="User Management"
      className="max-w-6xl mx-auto"
    >
      {actionLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={progressStatus} className="w-full h-1" />
        </div>
      )}
      
      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      
      {hasRoleIssue && !loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Database role configuration issue detected. Some features may have limited functionality.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="add-user" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="users">
          <TransitionLayout animationType="fade" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>
                  Click on a user's name to view their detailed profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserListSection 
                  users={users}
                  onUserNameClick={handleUserNameClick}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteUser}
                  actionLoading={actionLoading}
                  currentUserId={authUser?.id}
                  isSuperAdmin={isSuperAdmin}
                />
              </CardContent>
            </Card>
          </TransitionLayout>
        </TabsContent>
        
        {isSuperAdmin && (
          <TabsContent value="add-user">
            <TransitionLayout animationType="fade" delay={100}>
              <Card>
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                  <CardDescription>
                    Create a new user account with appropriate access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserFormSection
                    formData={newUser}
                    onInputChange={handleInputChange}
                    onRoleChange={handleRoleChange}
                    onSubmit={handleAddUser}
                    isSuperAdmin={isSuperAdmin}
                    loading={actionLoading}
                    formError={formError}
                  />
                </CardContent>
              </Card>
            </TransitionLayout>
          </TabsContent>
        )}
      </Tabs>
      
      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <UserDetailDialog
          user={selectedUser}
          onClose={() => setUserDetailOpen(false)}
          onEdit={() => {
            setUserDetailOpen(false);
            if (selectedUser) handleEditClick(selectedUser);
          }}
          isAdmin={isSuperAdmin || userRole === 'admin'}
        />
      </Dialog>
      
      {/* User Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <UserEditDialog
          user={editingUser}
          onClose={() => setDialogOpen(false)}
          onSave={handleEditUser}
          onChange={setEditingUser}
          onRoleChange={handleRoleChange}
          isSuperAdmin={isSuperAdmin}
          loading={actionLoading}
        />
      </Dialog>
    </AnimatedCard>
  );
};

export default UserManagementPage;
