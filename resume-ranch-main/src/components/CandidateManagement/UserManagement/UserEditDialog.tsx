
import React from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil } from 'lucide-react';
import UserRoleSelector from '../UserRoleSelector';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  department?: string;
  bio?: string;
}

interface UserEditDialogProps {
  user: UserData | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (user: UserData) => void;
  onRoleChange: (role: string) => void;
  isSuperAdmin: boolean;
  loading: boolean;
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({
  user,
  onClose,
  onSave,
  onChange,
  onRoleChange,
  isSuperAdmin,
  loading
}) => {
  if (!user) return null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof UserData) => {
    onChange({
      ...user,
      [field]: e.target.value
    });
  };
  
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>
          Update the user information and permissions.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={user.name}
              onChange={(e) => handleInputChange(e, 'name')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              type="email"
              value={user.email}
              onChange={(e) => handleInputChange(e, 'email')}
              disabled // Email cannot be changed after creation
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              value={user.phone || ''}
              onChange={(e) => handleInputChange(e, 'phone')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={user.location || ''}
              onChange={(e) => handleInputChange(e, 'location')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-department">Department</Label>
            <Input
              id="edit-department"
              value={user.department || ''}
              onChange={(e) => handleInputChange(e, 'department')}
            />
          </div>
          
          <UserRoleSelector 
            selectedRole={user.role}
            onRoleChange={onRoleChange}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-bio">Bio</Label>
          <Textarea
            id="edit-bio"
            rows={3}
            value={user.bio || ''}
            onChange={(e) => handleInputChange(e, 'bio')}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" /> Update User
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UserEditDialog;
