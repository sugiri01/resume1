
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from 'lucide-react';

interface BreadcrumbNavProps {
  activeTab: string;
  subPage?: string;
  candidateName?: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ 
  activeTab,
  subPage,
  candidateName
}) => {
  const getTabName = (tab: string) => {
    switch(tab) {
      case 'dashboard': return 'Dashboard';
      case 'admin': return 'Candidates';
      case 'upload': return 'Upload Data';
      case 'calendar': return 'Schedule';
      case 'analytics': return 'Analytics';
      case 'email': return 'Email Templates';
      case 'reports': return 'Reports';
      case 'settings': return 'Settings';
      default: return 'Home';
    }
  };

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        <BreadcrumbItem>
          {subPage || candidateName ? (
            <BreadcrumbLink href="#">{getTabName(activeTab)}</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{getTabName(activeTab)}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        
        {subPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {candidateName ? (
                <BreadcrumbLink href="#">{subPage}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{subPage}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
        
        {candidateName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{candidateName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
