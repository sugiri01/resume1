
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { UserData } from '@/services/userService';
import { Badge } from '@/components/ui/badge';

interface UserListSectionProps {
  users: UserData[];
  onUserNameClick: (user: UserData) => void;
  onEditClick: (user: UserData) => void;
  onDeleteClick: (id: string) => void;
  actionLoading: boolean;
  currentUserId?: string;
  isSuperAdmin: boolean;
}

const UserListSection: React.FC<UserListSectionProps> = ({
  users,
  onUserNameClick,
  onEditClick,
  onDeleteClick,
  actionLoading,
  currentUserId,
  isSuperAdmin
}) => {
  // Helper function to get role badge styling
  const getRoleBadgeClassname = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Helper function to get formatted role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-brand-50 dark:bg-brand-900/20">
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="px-4 py-3 text-left font-medium">Department</th>
            <th className="px-4 py-3 text-left font-medium">Last Login</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3">
                  <button
                    onClick={() => onUserNameClick(user)}
                    className="font-medium text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    {user.name}
                  </button>
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge className={`${getRoleBadgeClassname(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </td>
                <td className="px-4 py-3">{user.department || 'N/A'}</td>
                <td className="px-4 py-3">{user.lastLogin || 'Never'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(user)}
                      disabled={(!isSuperAdmin && user.role === 'super_admin') || actionLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteClick(user.id)}
                      disabled={(!isSuperAdmin && user.role === 'super_admin') || actionLoading || user.id === currentUserId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserListSection;
