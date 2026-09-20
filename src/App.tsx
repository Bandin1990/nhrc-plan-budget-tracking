import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { WordImportModal } from './components/projects/WordImportModal';
import { WordImportView } from './components/projects/WordImportView';
import { ProgressReportList } from './components/progress/ProgressReportList';
import { ProgressReportFormModal } from './components/progress/ProgressReportFormModal';
import { PrintableSnYo3 } from './components/progress/PrintableSnYo3';
import { BudgetTransferWizard } from './components/transfers/BudgetTransferWizard';
import { BudgetReturnModal } from './components/transfers/BudgetReturnModal';
import { PrintableOfficialMemo } from './components/transfers/PrintableOfficialMemo';
import { TransferHistoryList } from './components/transfers/TransferHistoryList';
import { ExecutivePrintReport } from './components/reports/ExecutivePrintReport';
import { BudgetComparisonView } from './components/budget/BudgetComparisonView';
import { UnitBreakdownView } from './components/reports/UnitBreakdownView';
import { UserPermissionManagement } from './components/auth/UserPermissionManagement';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { UserManualView } from './components/manual/UserManualView';
import { Project } from './types/project';
import { ProgressReport } from './types/progress';
import { OfficialMemoData } from './types/budget';
import { useProjects } from './contexts/ProjectContext';
import { useAuth } from './contexts/AuthContext';
import { LoginView } from './components/auth/LoginView';

export const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { projects, reports, memos, getReportById, getMemoById, setSelectedDivision } = useProjects();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isWordImportOpen, setIsWordImportOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);

  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [projectForReport, setProjectForReport] = useState<Project | null>(null);
  const [reportToEdit, setReportToEdit] = useState<ProgressReport | null>(null);

  // Active print models
  const [activePrintReport, setActivePrintReport] = useState<ProgressReport | null>(reports[0] || null);
  const [activePrintMemo, setActivePrintMemo] = useState<OfficialMemoData | null>(memos[0] || null);

  // Budget Return Modal State
  const [isBudgetReturnModalOpen, setIsBudgetReturnModalOpen] = useState(false);
  const [projectForBudgetReturn, setProjectForBudgetReturn] = useState<Project | null>(null);

  // Handlers
  const handleOpenNewProject = () => {
    setProjectToEdit(null);
    setIsProjectFormOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setProjectToEdit(proj);
    setIsProjectFormOpen(true);
  };

  const handleOpenReportProgress = (proj: Project) => {
    setProjectForReport(proj);
    setReportToEdit(null);
    setIsReportFormOpen(true);
  };

  const handleOpenEditReport = (rep: ProgressReport) => {
    const parent = projects.find(p => p.id === rep.projectId) || null;
    setProjectForReport(parent);
    setReportToEdit(rep);
    setIsReportFormOpen(true);
  };

  const handlePrintReport = (rep: ProgressReport) => {
    setActivePrintReport(rep);
    setActiveTab('print_snyo3');
  };

  const handlePrintReportById = (repId: string) => {
    const r = getReportById(repId);
    if (r) {
      setActivePrintReport(r);
      setIsDetailModalOpen(false);
      setActiveTab('print_snyo3');
    }
  };

  const handleOpenBudgetTransfer = (proj?: Project) => {
    setActiveTab('budget_transfers');
  };

  const handlePrintMemo = (m: OfficialMemoData) => {
    setActivePrintMemo(m);
    setActiveTab('print_memo');
  };

  const handleViewProjectDetails = (proj: Project) => {
    setSelectedProjectForDetail(proj);
    setIsDetailModalOpen(true);
  };

  const handleSelectUnitFilter = (unitCode: string) => {
    setSelectedDivision(unitCode);
    setActiveTab('project_catalog');
  };

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#f3f6f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar 
        onOpenQuickSearch={() => setActiveTab('project_catalog')}
        onNavigate={(tab) => setActiveTab(tab)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={(tab) => setActiveTab(tab)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Content Canvas */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewProject={handleOpenNewProject}
              onOpenWordImport={() => setActiveTab('word_import')}
            />
          )}

          {activeTab === 'word_import' && (
            <WordImportView
              onBack={() => setActiveTab('dashboard')}
              onSuccess={(proj) => {
                setSelectedProjectForDetail(proj);
                setIsDetailModalOpen(true);
                setActiveTab('project_catalog');
              }}
            />
          )}

          {activeTab === 'project_catalog' && (
            <ProjectList
              onOpenNewProject={handleOpenNewProject}
              onOpenWordImport={() => setActiveTab('word_import')}
              onOpenEditProject={handleOpenEditProject}
              onOpenReportProgress={handleOpenReportProgress}
              onOpenBudgetTransfer={handleOpenBudgetTransfer}
              onViewProjectDetails={handleViewProjectDetails}
              strategicOnly={false}
            />
          )}

          {activeTab === 'strategic_projects' && (
            <ProjectList
              onOpenNewProject={handleOpenNewProject}
              onOpenWordImport={() => setActiveTab('word_import')}
              onOpenEditProject={handleOpenEditProject}
              onOpenReportProgress={handleOpenReportProgress}
              onOpenBudgetTransfer={handleOpenBudgetTransfer}
              onViewProjectDetails={handleViewProjectDetails}
              strategicOnly={true}
            />
          )}

          {activeTab === 'progress_reports' && (
            <ProgressReportList
              onOpenNewReport={(projId) => {
                const targetProj = projId ? projects.find(p => p.id === projId) : projects[0];
                if (targetProj) handleOpenReportProgress(targetProj);
              }}
              onOpenEditReport={handleOpenEditReport}
              onPrintReport={handlePrintReport}
            />
          )}

          {activeTab === 'print_snyo3' && (
            activePrintReport ? (
              <PrintableSnYo3
                report={activePrintReport}
                onBack={() => setActiveTab('progress_reports')}
              />
            ) : (
              <ProgressReportList
                onOpenNewReport={(projId) => {
                  const targetProj = projId ? projects.find(p => p.id === projId) : projects[0];
                  if (targetProj) handleOpenReportProgress(targetProj);
                }}
                onOpenEditReport={handleOpenEditReport}
                onPrintReport={handlePrintReport}
              />
            )
          )}

          {activeTab === 'budget_transfers' && (
            <BudgetTransferWizard
              onSuccess={(createdMemo) => {
                setActivePrintMemo(createdMemo);
                setActiveTab('print_memo');
              }}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'print_memo' && (
            activePrintMemo ? (
              <PrintableOfficialMemo
                memo={activePrintMemo}
                onBack={() => setActiveTab('transfer_history')}
              />
            ) : (
              <TransferHistoryList
                onOpenNewTransfer={() => setActiveTab('budget_transfers')}
                onPrintMemo={handlePrintMemo}
              />
            )
          )}

          {activeTab === 'transfer_history' && (
            <TransferHistoryList
              onOpenNewTransfer={() => setActiveTab('budget_transfers')}
              onPrintMemo={handlePrintMemo}
            />
          )}

          {activeTab === 'executive_summary' && (
            <ExecutivePrintReport
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'budget_comparison' && (
            <BudgetComparisonView />
          )}

          {activeTab === 'unit_breakdown' && (
            <UnitBreakdownView
              onSelectUnitFilter={handleSelectUnitFilter}
            />
          )}

          {activeTab === 'user_permissions' && (
            <UserPermissionManagement />
          )}

          {activeTab === 'settings' && (
            <SystemSettingsView />
          )}

          {activeTab === 'user_manual' && (
            <UserManualView
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <WordImportModal
        isOpen={isWordImportOpen}
        onClose={() => setIsWordImportOpen(false)}
        onSuccess={(imported) => {
          setSelectedProjectForDetail(imported);
          setIsDetailModalOpen(true);
          setActiveTab('project_catalog');
        }}
      />

      <ProjectFormModal
        isOpen={isProjectFormOpen}
        projectToEdit={projectToEdit}
        onClose={() => setIsProjectFormOpen(false)}
      />

      <ProgressReportFormModal
        isOpen={isReportFormOpen}
        project={projectForReport}
        reportToEdit={reportToEdit}
        onClose={() => setIsReportFormOpen(false)}
        onSuccess={(savedReport) => {
          setActivePrintReport(savedReport);
          setActiveTab('print_snyo3');
        }}
      />

      <ProjectDetailModal
        project={selectedProjectForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenReportProgress={(p) => {
          setIsDetailModalOpen(false);
          handleOpenReportProgress(p);
        }}
        onOpenBudgetTransfer={(p) => {
          setIsDetailModalOpen(false);
          handleOpenBudgetTransfer(p);
        }}
        onOpenBudgetReturn={(p) => {
          setIsDetailModalOpen(false);
          setProjectForBudgetReturn(p);
          setIsBudgetReturnModalOpen(true);
        }}
        onOpenEditProject={(p) => {
          setIsDetailModalOpen(false);
          handleOpenEditProject(p);
        }}
        onPrintReport={handlePrintReportById}
      />

      <BudgetReturnModal
        project={projectForBudgetReturn}
        isOpen={isBudgetReturnModalOpen}
        onClose={() => setIsBudgetReturnModalOpen(false)}
        onSuccess={(memo) => {
          setActivePrintMemo(memo);
          setActiveTab('print_memo');
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
