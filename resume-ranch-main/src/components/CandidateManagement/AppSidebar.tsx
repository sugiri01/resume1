
import React, { useEffect } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Upload, 
  Users, 
  Settings, 
  FileSpreadsheet,
  UserPlus,
  Shield
} from 'lucide-react';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, onTabChange, userRole = 'user' }) => {
  // Add debug logs
  useEffect(() => {
    console.log('AppSidebar - Current user role:', userRole);
  }, [userRole]);
  
  // Define menu items with role-based access
  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin', 'super_admin'] },
    { id: 'admin', title: 'Candidates', icon: Users, roles: ['user', 'admin', 'super_admin'] },
    { id: 'upload', title: 'Upload Data', icon: Upload, roles: ['admin', 'super_admin'] },
    { id: 'reports', title: 'Reports', icon: FileSpreadsheet, roles: ['user', 'admin', 'super_admin'] },
    { id: 'user-management', title: 'User Management', icon: UserPlus, roles: ['admin', 'super_admin'] },
    { id: 'roles', title: 'Role Management', icon: Shield, roles: ['super_admin'] },
    { id: 'settings', title: 'Settings', icon: Settings, roles: ['user', 'admin', 'super_admin'] }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // Normalize role comparison to handle different formats and cases
    const normalizedUserRole = userRole.toLowerCase().replace(/[_\s-]/g, '');
    
    return item.roles.some(role => {
      const normalizedItemRole = role.toLowerCase().replace(/[_\s-]/g, '');
      return normalizedItemRole === normalizedUserRole || 
        (normalizedItemRole === 'superadmin' && (normalizedUserRole === 'superadmin' || normalizedUserRole === 'super_admin'));
    });
  });

  console.log('Filtered menu items:', filteredMenuItems.map(item => item.id));

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="flex items-center justify-center py-4">
        <div className="bg-brand-500 text-white p-2 rounded-lg">
          <Users size={24} />
        </div>
        <h1 className="ml-3 text-lg font-semibold text-sidebar-foreground">Arete Talent Manager</h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 text-xs text-sidebar-foreground opacity-70">
          &copy; {new Date().getFullYear()} Arete Talent Management System
          <div className="mt-1">Current Role: {userRole}</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
