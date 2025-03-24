
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Filter, Save, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import SearchBar from './SearchBar';
import TableRow from './TableRow';
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

interface AdminPanelProps {
  columns: Column[];
  candidates: Candidate[];
  filteredCandidates: Candidate[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  recordsPerPage: number;
  indexOfFirstRecord: number;
  indexOfLastRecord: number;
  showFilters: boolean;
  filters: Record<string, string>;
  editingId: number | null;
  editForm: Candidate;
  newCandidateMode: boolean;
  selectedCandidates: number[];
  selectAllChecked: boolean;
  onSelectAll: (isSelected: boolean) => void;
  onSelectCandidate: (index: number, isSelected: boolean) => void;
  onBulkDelete: () => void;
  onToggleFilters: () => void;
  onFilterChange: (field: string, value: string) => void;
  onClearFilters: () => void;
  onAddNewCandidate: () => void;
  onSaveNewCandidate: () => void;
  onCancel: () => void;
  onEdit: (candidate: Candidate, index: number) => void;
  onSave: (index: number) => void;
  onDelete: (index: number) => void;
  onPageChange: (page: number) => void;
  onRecordsPerPageChange: (value: number) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  columns,
  candidates,
  filteredCandidates,
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  recordsPerPage,
  indexOfFirstRecord,
  indexOfLastRecord,
  showFilters,
  filters,
  editingId,
  editForm,
  newCandidateMode,
  selectedCandidates,
  selectAllChecked,
  onSelectAll,
  onSelectCandidate,
  onBulkDelete,
  onToggleFilters,
  onFilterChange,
  onClearFilters,
  onAddNewCandidate,
  onSaveNewCandidate,
  onCancel,
  onEdit,
  onSave,
  onDelete,
  onPageChange,
  onRecordsPerPageChange,
  onChange,
}) => {
  const currentRecords = filteredCandidates.slice(indexOfFirstRecord, indexOfLastRecord);
  
  return (
    <AnimatedCard
      title="Manage Candidates"
      rightHeaderContent={
        <div className="flex space-x-2">
          <Button 
            onClick={onToggleFilters} 
            variant="outline"
            className="border-brand-200 hover:bg-brand-50 text-brand-700"
          >
            <Filter className="mr-2 h-4 w-4" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            onClick={onAddNewCandidate}
            className="bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Add Candidate
          </Button>
        </div>
      }
      className="overflow-hidden"
    >
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search candidates by name, skill, location..."
          className="w-full md:w-1/2 lg:w-1/3"
        />
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="mb-8 p-6 rounded-lg bg-brand-50 border border-brand-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-brand-700">Filters</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="h-8 text-xs border-brand-200 hover:bg-white text-brand-700"
            >
              Clear Filters
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {columns.map((col) => (
              <div key={col.field} className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-brand-600 flex items-center">
                  {col.icon}
                  <span className="ml-1.5">{col.display || col.field}</span>
                </label>
                {col.type === 'text' && (
                  <Input
                    className="h-8 text-sm bg-white"
                    value={filters[col.field] || ''}
                    onChange={(e) => onFilterChange(col.field, e.target.value)}
                    placeholder={`Filter by ${col.display || col.field}`}
                  />
                )}
                {col.type === 'number' && (
                  <Input
                    className="h-8 text-sm bg-white"
                    type="number"
                    value={filters[col.field] || ''}
                    onChange={(e) => onFilterChange(col.field, e.target.value)}
                    placeholder={`Filter by ${col.field}`}
                  />
                )}
                {col.type === 'date' && (
                  <Input
                    className="h-8 text-sm bg-white"
                    type="date"
                    value={filters[col.field] || ''}
                    onChange={(e) => onFilterChange(col.field, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Candidate Form */}
      {newCandidateMode && (
        <div className="mb-8 p-6 rounded-lg bg-brand-50 border border-brand-200">
          <h3 className="text-lg font-medium text-brand-700 mb-4">Add New Candidate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div key={col.field} className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-brand-600 flex items-center">
                  {col.icon}
                  <span className="ml-1.5">{col.display}</span>
                </label>
                <Input
                  className="bg-white"
                  type={col.type === 'date' ? 'date' : col.type}
                  value={editForm[col.field] || ''}
                  onChange={(e) => onChange(e, col.field)}
                  placeholder={col.display || col.field}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button 
              onClick={onSaveNewCandidate}
              className="bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="border-brand-200 hover:bg-white text-brand-700"
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Results count and records per page */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-brand-600">
        <p>
          {filteredCandidates.length > 0 
            ? `Showing ${indexOfFirstRecord + 1} to ${Math.min(indexOfLastRecord, filteredCandidates.length)} of ${filteredCandidates.length} candidates` 
            : 'No candidates match your criteria'
          }
        </p>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <label>Records per page:</label>
          <select 
            className="border border-brand-200 rounded p-1 bg-white"
            value={recordsPerPage}
            onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <div className="bg-brand-50 p-3 mb-4 rounded-lg border border-brand-100 flex items-center justify-between">
          <div className="text-sm text-brand-700">
            <span className="font-medium">{selectedCandidates.length}</span> candidate(s) selected
          </div>
          <Button 
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
          </Button>
        </div>
      )}

      {/* Candidates Table */}
      {filteredCandidates.length > 0 ? (
        <div className="overflow-x-auto -mx-6 mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-50 border-y border-brand-100">
                <th className="px-4 py-3 text-left">
                  <Checkbox 
                    checked={selectAllChecked}
                    onCheckedChange={onSelectAll}
                    className="data-[state=checked]:bg-brand-500"
                  />
                </th>
                {columns.map(col => (
                  <th key={col.field} className="table-header-cell">
                    <div className="flex items-center">
                      {col.icon}
                      <span className="ml-1">{col.display}</span>
                    </div>
                  </th>
                ))}
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((candidate, index) => {
                const actualIndex = filteredCandidates.indexOf(candidate);
                const isSelected = selectedCandidates.includes(actualIndex);
                
                return (
                  <TableRow 
                    key={actualIndex}
                    candidate={candidate}
                    columns={columns}
                    index={index}
                    isEditing={editingId === actualIndex}
                    editForm={editForm}
                    onEdit={() => onEdit(candidate, actualIndex)}
                    onSave={() => onSave(actualIndex)}
                    onCancel={onCancel}
                    onDelete={() => onDelete(actualIndex)}
                    onChange={(field, value) => {
                      const e = { target: { value } } as React.ChangeEvent<HTMLInputElement>;
                      onChange(e, field);
                    }}
                    isSelected={isSelected}
                    onSelect={(checked) => onSelectCandidate(actualIndex, checked)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-brand-400">No candidates found matching your criteria.</p>
          {Object.keys(filters).length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="mt-4 border-brand-200 hover:bg-brand-50 text-brand-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredCandidates.length > 0 && (
        <div className="flex items-center justify-center space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 border-brand-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Page number buttons */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                let startPage = Math.max(1, currentPage - 2);
                if (currentPage > totalPages - 2) {
                  startPage = Math.max(1, totalPages - 4);
                }
                pageNum = startPage + i;
              }
              
              if (pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={`h-8 w-8 p-0 ${
                      currentPage === pageNum 
                        ? 'bg-brand-500 hover:bg-brand-600 text-white'
                        : 'border-brand-200 text-brand-700'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 border-brand-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </AnimatedCard>
  );
};

export default AdminPanel;
