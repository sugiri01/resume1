import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UserPlus, FileSpreadsheet, Download, LogOut, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Candidate, Column, UploadHistory } from '@/types/candidate';
import { fetchCandidates, downloadCandidates, downloadTemplate } from '@/utils/candidateUtils';
import Dashboard from '@/components/CandidateManagement/Dashboard';
import DragDropUpload from '@/components/CandidateManagement/DragDropUpload';
import AdminPanel from '@/components/CandidateManagement/AdminPanel';
import AppSidebar from '@/components/CandidateManagement/AppSidebar';
import BreadcrumbNav from '@/components/CandidateManagement/BreadcrumbNav';
import SearchBar from '@/components/CandidateManagement/SearchBar';
import ReportsPage from '@/components/CandidateManagement/ReportsPage';
import SettingsPage from '@/components/CandidateManagement/SettingsPage';
import UserManagementPage from '@/components/CandidateManagement/UserManagementPage';
import RoleManagementPage from '@/components/CandidateManagement/RoleManagementPage';
import { useCandidateState } from '@/hooks/useCandidateState';
import useFileUpload from '@/hooks/useFileUpload';
import HeaderActions from '@/components/CandidateManagement/HeaderActions';
import AppHeader from '@/components/CandidateManagement/AppHeader';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const columns: Column[] = [
    { field: 'Name', display: 'Full Name', icon: <UserPlus className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'Phone', display: 'Phone Number', icon: <Search className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'Email', display: 'Email Address', icon: <Search className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'Location', display: 'Location', icon: <Search className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'Tech', display: 'Technology Stack', icon: <Search className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'Number of Experience', display: 'Years of Experience', icon: <Search className="h-4 w-4 mr-1" />, type: 'number' },
    { field: 'Data Source', display: 'Source of Data', icon: <FileSpreadsheet className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'When Data is loaded in database', display: 'Database Upload Date', icon: <FileSpreadsheet className="h-4 w-4 mr-1" />, type: 'date' },
    { field: 'Currency Sal', display: 'Salary (Currency)', icon: <Search className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'Which Company working', display: 'Current Company', icon: <Search className="h-4 w-4 mr-1" />, type: 'text' },
    { field: 'When was the profile updated lastly', display: 'Last Profile Update', icon: <FileSpreadsheet className="h-4 w-4 mr-1" />, type: 'date' }
  ];

  const emptyCandidate: Candidate = columns.reduce<Candidate>((obj, col) => {
    obj[col.field] = '';
    return obj;
  }, {} as Candidate);

  const { toast } = useToast();
  const { user, userRole, signOut, updateUserRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardFilter, setDashboardFilter] = useState('all-time');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [subPage, setSubPage] = useState<string | undefined>(undefined);
  const [candidateName, setCandidateName] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log('Current user role in Index:', userRole);
    console.log('Current user metadata:', user?.user_metadata);
  }, [userRole, user]);

  const {
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
    handleBulkDelete,
    indexOfFirstRecord,
    indexOfLastRecord,
    totalPages,
    filteredCandidates,
    paginate
  } = useCandidateState(emptyCandidate, userRole, toast, user?.id);

  const { 
    uploadStatus, 
    uploadProgress,
    handleFileUpload: processFile,
    resetUpload
  } = useFileUpload({
    emptyCandidate,
    onUploadSuccess: (newCandidates, fileName) => {
      setCandidates(prevCandidates => [...prevCandidates, ...newCandidates]);
      setActiveTab('dashboard');
      
      // Instead of setting local state, we'll insert into database
      // and fetch the updated history
      fetchUploadHistory();
    },
    userId: user?.id
  });

  const fetchUploadHistory = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('upload_history')
        .select('*')
        .order('upload_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching upload history:', error);
        return;
      }
      
      if (data) {
        const formattedHistory: UploadHistory[] = data.map(item => ({
          filename: item.filename,
          date: new Date(item.upload_date).toISOString().split('T')[0],
          success: item.success_count,
          error: item.error_count,
          total: item.total_records
        }));
        
        setUploadHistory(formattedHistory);
      }
    } catch (err) {
      console.error('Error in fetchUploadHistory:', err);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      try {
        fetchCandidates(user.id, toast)
          .then(data => {
            setCandidates(data);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching candidates:', error);
            toast({
              title: "Error",
              description: error.message || "Failed to fetch candidates",
              variant: "destructive"
            });
            setLoading(false);
          });
      } catch (error) {
        console.error('Error in fetching candidates:', error);
        setLoading(false);
      }
      
      // Fetch upload history from database
      fetchUploadHistory();
    }
  }, [user, toast]);

  useEffect(() => {
    if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
      if (activeTab !== 'admin') {
        setActiveTab('admin');
      }
    }
  }, [globalSearchTerm]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    downloadCandidates(candidates, toast);
  };

  const handleTemplateDownload = () => {
    downloadTemplate(toast);
  };

  const handleAddNewCandidate = () => {
    if (userRole === 'user') {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add new candidates",
        variant: "destructive"
      });
      return;
    }
    
    setNewCandidateMode(true);
    setEditForm({
      ...emptyCandidate,
      'When Data is loaded in database': new Date().toISOString().split('T')[0],
      'When was the profile updated lastly': new Date().toISOString().split('T')[0],
      'Data Source': 'Manual Entry'
    });
    setSubPage('Add New');
  };

  const handleRunReport = () => {
    setActiveTab('reports');
  };

  const handleFilterDashboard = (filter: string) => {
    setDashboardFilter(filter);
    toast({
      title: "Dashboard Filter",
      description: `Showing data for ${filter}`,
      variant: "default"
    });
  };

  const handleTabChange = (tab: string) => {
    console.log('Changing to tab:', tab, 'Current user role:', userRole);
    setActiveTab(tab);
    
    setSubPage(undefined);
    setCandidateName(undefined);
    
    if (tab !== 'admin') {
      setEditingId(null);
      setNewCandidateMode(false);
      setEditForm({...emptyCandidate});
    }
  };

  const toggleUserRole = () => {
    let nextRole = '';
    
    if (userRole === 'super_admin') {
      nextRole = 'admin';
    } else if (userRole === 'admin') {
      nextRole = 'user';
    } else {
      nextRole = 'super_admin';
    }
    
    updateUserRole(nextRole);
    
    toast({
      title: "Role Changed",
      description: `Switched to ${nextRole === 'super_admin' ? 'Super Admin' : nextRole === 'admin' ? 'Admin' : 'User'} role`,
      variant: "default"
    });

    console.log(`Role changed to: ${nextRole}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <SidebarProvider className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} userRole={userRole} />
      
      <SidebarInset className="relative">
        <AppHeader 
          globalSearchTerm={globalSearchTerm}
          setGlobalSearchTerm={setGlobalSearchTerm}
          onDownload={handleDownload}
          onSignOut={handleSignOut}
          toggleUserRole={toggleUserRole}
          userRole={userRole}
          candidates={candidates}
        />

        <main className="container mx-auto px-4 py-6">
          <BreadcrumbNav 
            activeTab={activeTab} 
            subPage={subPage} 
            candidateName={candidateName} 
          />
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  candidates={candidates} 
                  columns={columns}
                  onViewAll={() => setActiveTab('admin')}
                  onUpload={() => setActiveTab('upload')}
                  onAddCandidate={handleAddNewCandidate}
                  onRunReport={handleRunReport}
                  onFilterChange={handleFilterDashboard}
                  userRole={userRole}
                />
              )}

              {activeTab === 'upload' && (
                <DragDropUpload 
                  columns={columns}
                  uploadStatus={uploadStatus}
                  uploadProgress={uploadProgress}
                  onFileUpload={handleFileUpload}
                  onTemplateDownload={handleTemplateDownload}
                  uploadHistory={uploadHistory}
                />
              )}

              {activeTab === 'admin' && (
                <AdminPanel 
                  columns={columns}
                  candidates={candidates}
                  filteredCandidates={filteredCandidates}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  recordsPerPage={recordsPerPage}
                  indexOfFirstRecord={indexOfFirstRecord}
                  indexOfLastRecord={indexOfLastRecord}
                  showFilters={showFilters}
                  filters={filters}
                  editingId={editingId}
                  editForm={editForm}
                  newCandidateMode={newCandidateMode}
                  onToggleFilters={toggleFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  onAddNewCandidate={handleAddNewCandidate}
                  onSaveNewCandidate={() => handleSave(-1)}
                  onCancel={handleCancel}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onPageChange={paginate}
                  onRecordsPerPageChange={setRecordsPerPage}
                  onChange={handleChange}
                  selectedCandidates={selectedCandidates}
                  onSelectCandidate={handleSelectCandidate}
                  selectAllChecked={selectAllChecked}
                  onSelectAll={handleSelectAll}
                  onBulkDelete={handleBulkDelete}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsPage
                  candidates={candidates}
                  uploadHistory={uploadHistory}
                />
              )}
              
              {activeTab === 'settings' && (
                <SettingsPage />
              )}
              
              {activeTab === 'user-management' && (
                <UserManagementPage userRole={userRole} />
              )}
              
              {activeTab === 'roles' && (
                <RoleManagementPage />
              )}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Index;
