
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import TransitionLayout from './TransitionLayout';

interface Column {
  field: string;
  display: string;
  icon: React.ReactNode;
  type: string;
}

interface Candidate {
  [key: string]: string;
}

interface TableRowProps {
  candidate: Candidate;
  columns: Column[];
  index: number;
  isEditing: boolean;
  editForm: Candidate;
  isSelected?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onChange: (field: string, value: string) => void;
  onSelect?: (checked: boolean) => void;
  animationDelay?: number;
}

const TableRow: React.FC<TableRowProps> = ({
  candidate,
  columns,
  index,
  isEditing,
  editForm,
  isSelected = false,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onChange,
  onSelect,
  animationDelay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <tr 
      className={`border-b border-brand-100 ${isHovered ? 'bg-brand-50' : 'bg-transparent'} ${isSelected ? 'bg-brand-50/70' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox column */}
      <td className="p-2 border-b border-brand-100">
        {!isEditing && onSelect && (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(checked === true)}
            className="data-[state=checked]:bg-brand-500"
          />
        )}
      </td>
      
      {isEditing ? (
        // Edit mode
        <>
          {columns.map((col) => (
            <td key={col.field} className="p-2 border-b border-brand-100">
              <Input
                type={col.type === 'date' ? 'date' : col.type}
                value={editForm[col.field] || ''}
                onChange={(e) => onChange(col.field, e.target.value)}
                className="w-full h-9 px-3 py-1 text-sm"
              />
            </td>
          ))}
          <td className="p-2 border-b border-brand-100">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-brand-500 hover:bg-brand-600 text-white h-8"
                onClick={onSave}
              >
                <Save className="h-3.5 w-3.5" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-brand-200 hover:bg-brand-50 text-brand-700 h-8"
                onClick={onCancel}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </td>
        </>
      ) : (
        // View mode
        <>
          {columns.map((col) => (
            <td 
              key={col.field} 
              className="px-3 py-3.5 first:pl-4 text-sm border-b border-brand-100"
            >
              {candidate[col.field]}
            </td>
          ))}
          <td className="p-2 border-b border-brand-100">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-brand-200 hover:bg-brand-50 text-brand-600 h-8"
                onClick={onEdit}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-brand-200 hover:bg-red-50 text-red-500 hover:text-red-600 h-8"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </td>
        </>
      )}
    </tr>
  );
};

export default TableRow;
