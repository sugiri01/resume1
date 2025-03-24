
import React from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Briefcase, Calendar, Pencil } from 'lucide-react';
import { UserData } from '@/services/userService';

interface UserDetailDialogProps {
  user: UserData | null;
  onClose: () => void;
  onEdit: () => void;
  isAdmin: boolean;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  user,
  onClose,
  onEdit,
  isAdmin
}) => {
  if (!user) return null;
  
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>User Profile</DialogTitle>
        <DialogDescription>
          Detailed information about the user
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-brand-700 text-2xl font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{
            user.role === 'super_admin' ? 'Super Admin' : 
            user.role === 'admin' ? 'Admin' : 'User'
          }</p>
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-500" />
            <span>{user.email}</span>
          </div>
          
          {user.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-500" />
              <span>{user.phone}</span>
            </div>
          )}
          
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-500" />
              <span>{user.location}</span>
            </div>
          )}
          
          {user.department && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-500" />
              <span>{user.department}</span>
            </div>
          )}
          
          {user.joinDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-500" />
              <span>Joined: {user.joinDate}</span>
            </div>
          )}
        </div>
        
        {user.bio && (
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-1">Bio</h4>
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          </div>
        )}
        
        <div className="pt-2">
          <h4 className="text-sm font-medium mb-1">Permissions</h4>
          <div className="flex flex-wrap gap-1">
            {user.role === 'user' && (
              <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                View Candidates
              </span>
            )}
            
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <>
                <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  View Candidates
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  Edit Candidates
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  Delete Candidates
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  Upload Data
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  Run Reports
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  Manage Users
                </span>
              </>
            )}
            
            {user.role === 'super_admin' && (
              <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                Manage Roles
              </span>
            )}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
        {isAdmin && (
          <Button onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default UserDetailDialog;
