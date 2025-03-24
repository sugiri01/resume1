
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  lastLogin?: string;
}

interface UserListingSectionProps {
  users: UserData[];
  onUserNameClick: (user: UserData) => void;
  onEditClick: (user: UserData) => void;
  onDeleteClick: (id: string) => void;
  isSuperAdmin: boolean;
  currentUserId?: string;
  actionLoading: boolean;
}

const UserListingSection: React.FC<UserListingSectionProps> = ({
  users,
  onUserNameClick,
  onEditClick,
  onDeleteClick,
  isSuperAdmin,
  currentUserId,
  actionLoading
}) => {
  // Function to format role display names correctly
  const formatRoleName = (role: string): string => {
    switch(role) {
      case 'super_admin':
      case 'superadmin':
      case 'super admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'user':
        return 'User';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  // Function to get role styling
  const getRoleStyles = (role: string): string => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('super')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    } else if (lowerRole === 'admin') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
          {users.map((user) => (
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
                <span className={`px-2 py-1 rounded-full text-xs ${getRoleStyles(user.role)}`}>
                  {formatRoleName(user.role)}
                </span>
              </td>
              <td className="px-4 py-3">{user.department || 'N/A'}</td>
              <td className="px-4 py-3">{user.lastLogin || 'Never'}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick(user)}
                    disabled={(user.role.toLowerCase().includes('super') && !isSuperAdmin) || actionLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick(user.id)}
                    disabled={(user.role.toLowerCase().includes('super') && !isSuperAdmin) || actionLoading || user.id === currentUserId}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListingSection;
