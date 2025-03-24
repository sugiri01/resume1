
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';

interface HeaderActionsProps {
  onFilterChange?: (filter: string) => void;
  onExport?: () => void;
  showExport?: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ 
  onFilterChange,
  onExport,
  showExport = true
}) => {
  return (
    <div className="flex gap-2">
      {onFilterChange && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterChange('this-week')}
            className="text-xs"
          >
            This Week
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterChange('this-month')}
            className="text-xs"
          >
            This Month
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFilterChange('all-time')}
            className="text-xs"
          >
            All Time
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
          >
            <Filter className="h-3 w-3 mr-1" /> More
          </Button>
        </>
      )}
      
      {showExport && onExport && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onExport}
          className="text-xs"
        >
          <Download className="h-3 w-3 mr-1" /> Export
        </Button>
      )}
    </div>
  );
};

export default HeaderActions;
