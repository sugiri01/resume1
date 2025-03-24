
import { useState, useMemo } from 'react';
import { Candidate, UploadHistory } from '@/types/candidate';
import { updateCandidateInSupabase } from '@/utils/candidateUtils';

export const useCandidateState = (emptyCandidate: Candidate, userRole: string, toast: any, userId?: string) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Candidate>({...emptyCandidate});
  const [newCandidateMode, setNewCandidateMode] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);

  // Filter candidates based on search term and column filters
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Check if candidate matches search term
      const matchesSearch = searchTerm === '' || 
        Object.values(candidate).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Check if candidate matches all active filters
      const matchesFilters = Object.entries(filters).every(([field, value]) => {
        if (!value) return true;
        
        const candidateValue = String(candidate[field] || '').toLowerCase();
        return candidateValue.includes(value.toLowerCase());
      });
      
      return matchesSearch && matchesFilters;
    });
  }, [candidates, searchTerm, filters]);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const totalPages = Math.ceil(filteredCandidates.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    const updatedFilters = { ...filters };
    if (value === '') {
      delete updatedFilters[field];
    } else {
      updatedFilters[field] = value;
    }
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    
    toast({
      title: "Filters Cleared",
      description: "All search filters have been reset",
      variant: "default"
    });
  };

  // Edit functions
  const handleEdit = (candidate: Candidate, index: number) => {
    // Check if user has permission to edit candidates
    if (userRole === 'user') {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit candidates",
        variant: "destructive"
      });
      return;
    }
    
    setEditingId(index);
    setEditForm({...candidate});
    setNewCandidateMode(false);
  };

  const handleSave = async (index: number) => {
    // Validate required fields
    if (!editForm.Name || !editForm.Email) {
      toast({
        title: "Validation Error",
        description: "Name and Email are required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Update the "last updated" field
    const updatedForm = {
      ...editForm,
      'When was the profile updated lastly': new Date().toISOString().split('T')[0]
    };
    
    try {
      // For new candidate (index === -1) vs updating existing
      if (index === -1) {
        // This is a new candidate
        const updatedCandidates = [...candidates, updatedForm];
        setCandidates(updatedCandidates);
        setNewCandidateMode(false);
        setEditForm({...emptyCandidate});
        
        toast({
          title: "Candidate Added",
          description: "New candidate has been successfully added",
          variant: "default"
        });
      } else {
        // Update in database
        if (!userId) {
          throw new Error("User ID is required for updating candidates");
        }
        
        const updateSuccess = await updateCandidateInSupabase(updatedForm, userId, toast);
        
        if (updateSuccess) {
          const updatedCandidates = [...candidates];
          updatedCandidates[index] = updatedForm;
          setCandidates(updatedCandidates);
          setEditingId(null);
          
          toast({
            title: "Changes Saved",
            description: "Candidate information has been updated",
            variant: "default"
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving candidate:", error);
      toast({
        title: "Error Saving Changes",
        description: error.message || "An error occurred while saving changes",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewCandidateMode(false);
    setEditForm({...emptyCandidate});
    setSelectedCandidates([]);
    setSelectAllChecked(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setEditForm({...editForm, [field]: e.target.value});
  };

  // Delete a single candidate
  const handleDelete = async (index: number) => {
    // Check if user has permission to delete candidates
    if (userRole === 'user') {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete candidates",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Remove from local state
      const updatedCandidates = candidates.filter((_, i) => i !== index);
      setCandidates(updatedCandidates);
      
      toast({
        title: "Candidate Removed",
        description: "The candidate has been removed from the system",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Deleting Candidate",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle multiple candidate selection
  const handleSelectCandidate = (index: number, isSelected: boolean) => {
    setSelectedCandidates(prev => {
      if (isSelected) {
        return [...prev, index];
      } else {
        return prev.filter(i => i !== index);
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (isSelected: boolean) => {
    setSelectAllChecked(isSelected);
    if (isSelected) {
      // Get indices of all filtered candidates on current page
      const pageIndices = filteredCandidates
        .slice(indexOfFirstRecord, indexOfLastRecord)
        .map((_, localIndex) => indexOfFirstRecord + localIndex);
      setSelectedCandidates(pageIndices);
    } else {
      setSelectedCandidates([]);
    }
  };

  // Bulk delete selected candidates
  const handleBulkDelete = async () => {
    // Check if user has permission to delete candidates
    if (userRole === 'user') {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete candidates",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCandidates.length === 0) {
      toast({
        title: "No Candidates Selected",
        description: "Please select at least one candidate to delete",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remove from local state
      const updatedCandidates = candidates.filter((_, index) => !selectedCandidates.includes(index));
      setCandidates(updatedCandidates);
      
      // Reset selection
      setSelectedCandidates([]);
      setSelectAllChecked(false);
      
      toast({
        title: "Candidates Removed",
        description: `${selectedCandidates.length} candidates have been removed from the system`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Deleting Candidates",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    candidates,
    setCandidates,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    currentPage,
    setCurrentPage,
    recordsPerPage,
    setRecordsPerPage,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    newCandidateMode,
    setNewCandidateMode,
    selectedCandidates,
    setSelectedCandidates,
    selectAllChecked,
    setSelectAllChecked,
    uploadHistory,
    setUploadHistory,
    filteredCandidates,
    indexOfFirstRecord,
    indexOfLastRecord,
    totalPages,
    paginate,
    handleFilterChange,
    toggleFilters,
    clearFilters,
    handleEdit,
    handleSave,
    handleCancel,
    handleChange,
    handleDelete,
    handleSelectCandidate,
    handleSelectAll,
    handleBulkDelete
  };
};
