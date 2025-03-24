
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import UserRoleSelector from '../UserRoleSelector';

interface UserFormProps {
  formData: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    location: string;
    department: string;
    bio: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => void;
  onRoleChange: (role: string) => void;
  onSubmit: () => void;
  isSuperAdmin: boolean;
  loading: boolean;
  formError: string | null;
}

const UserFormSection: React.FC<UserFormProps> = ({
  formData,
  onInputChange,
  onRoleChange,
  onSubmit,
  isSuperAdmin,
  loading,
  formError
}) => {
  return (
    <div className="grid gap-6">
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p>{formError}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => onInputChange(e, 'name')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => onInputChange(e, 'email')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange(e, 'password')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => onInputChange(e, 'phone')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={(e) => onInputChange(e, 'location')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="e.g., Human Resources"
            value={formData.department}
            onChange={(e) => onInputChange(e, 'department')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Brief description about the user"
          rows={3}
          value={formData.bio}
          onChange={(e) => onInputChange(e, 'bio')}
        />
      </div>
      
      <UserRoleSelector 
        selectedRole={formData.role}
        onRoleChange={onRoleChange}
        isSuperAdmin={isSuperAdmin}
      />
      
      <Button 
        onClick={onSubmit} 
        className="w-full md:w-auto"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding User...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </>
        )}
      </Button>
    </div>
  );
};

export default UserFormSection;
