
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface UserRoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  isSuperAdmin?: boolean;
}

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({ 
  selectedRole, 
  onRoleChange,
  isSuperAdmin = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role</Label>
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="role-user" 
            checked={selectedRole === 'user'}
            onCheckedChange={() => onRoleChange('user')}
          />
          <Label htmlFor="role-user" className="cursor-pointer">User</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="role-admin" 
            checked={selectedRole === 'admin'}
            onCheckedChange={() => onRoleChange('admin')}
          />
          <Label htmlFor="role-admin" className="cursor-pointer">Admin</Label>
        </div>
        
        {isSuperAdmin && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="role-super-admin" 
              checked={selectedRole === 'super_admin'}
              onCheckedChange={() => onRoleChange('super_admin')}
            />
            <Label htmlFor="role-super-admin" className="cursor-pointer">Super Admin</Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleSelector;
