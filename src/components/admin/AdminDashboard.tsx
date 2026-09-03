import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboardHome } from './AdminDashboardHome';
import { AdminLiveActivityView } from './AdminLiveActivityView';
import { ParticipantTable } from './ParticipantTable';
import { ParticipantDetailDrawer } from './ParticipantDetailDrawer';
import { EmailComposerModal } from './EmailComposerModal';
import { EmailTemplatesView } from './EmailTemplatesView';
import { AnalyticsView } from './AnalyticsView';
import { ClassSettingsView } from './ClassSettingsView';
import { WhatsAppManagerView } from './WhatsAppManagerView';
import { AuditLogView } from './AuditLogView';
import { AdminSettingsView } from './AdminSettingsView';
import { ImportExportModal } from './ImportExportModal';
import { AddParticipantModal } from './AddParticipantModal';
import {
  AdminUser,
  AdminParticipant,
  CRMStats,
  EmailTemplate,
  ClassSettings,
  AuditLog,
  ParticipantStatus,
} from '../../types';
import { adminApi } from '../../utils/adminApi';

interface AdminDashboardProps {
  initialTab?: AdminTab;
  onLogout: () => void;
  onViewLandingPage: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'dashboard',
  onLogout,
  onViewLandingPage,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialTab);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [classSettings, setClassSettings] = useState<ClassSettings | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Participants Table State
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedInterest, setSelectedInterest] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals and Drawers
  const [activeDrawerParticipant, setActiveDrawerParticipant] = useState<AdminParticipant | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTargetParticipant, setEmailTargetParticipant] = useState<AdminParticipant | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 1. Initial Data Fetch (User, Stats, Settings, Templates)
  const fetchCoreData = useCallback(async () => {
    try {
      const [userData, statsData, settingsData, templatesData, logsData] = await Promise.all([
        adminApi.getMe(),
        adminApi.getStats(),
        adminApi.getClassSettings(),
        adminApi.getEmailTemplates(),
        adminApi.getAuditLogs(),
      ]);

      if (userData) setAdminUser(userData);
      if (statsData) setStats(statsData);
      if (settingsData) setClassSettings(settingsData);
      if (templatesData) setTemplates(templatesData);
      if (logsData) setAuditLogs(logsData);
    } catch (err) {
      console.warn('Error fetching core dashboard data:', err);
    }
  }, []);

  // 2. Fetch Participants (Filtered & Paginated)
  const fetchParticipants = useCallback(async () => {
    setIsLoadingParticipants(true);
    try {
      const res = await adminApi.getParticipants({
        q: searchQuery,
        device: selectedDevice,
        canva_experience: selectedExperience,
        source: selectedSource,
        status: selectedStatus,
        learning_interest: selectedInterest,
        page: currentPage,
        limit: pageSize,
      });

      setParticipants(res.participants || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.warn('Error fetching participants:', err);
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [
    searchQuery,
    selectedDevice,
    selectedExperience,
    selectedSource,
    selectedStatus,
    selectedInterest,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    fetchCoreData();
    // Auto-refresh live participants every 10 seconds.
    // Only poll core settings when not actively on the class settings tab so user modifications are never overwritten.
    const interval = setInterval(() => {
      if (currentTab !== 'class_settings' && currentTab !== 'settings') {
        fetchCoreData();
      }
      fetchParticipants();
    }, 10000);

    const handleFocus = () => {
      if (currentTab !== 'class_settings' && currentTab !== 'settings') {
        fetchCoreData();
      }
      fetchParticipants();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCoreData, fetchParticipants, currentTab]);

  // Handle Tab Switch (Special cases like 'send_email')
  const handleSelectTab = (tab: AdminTab) => {
    if (tab === 'send_email') {
      setEmailTargetParticipant(null);
      setIsEmailModalOpen(true);
      return;
    }
    setCurrentTab(tab);

    const pathMap: Record<AdminTab, string> = {
      dashboard: '/admin/dashboard',
      live_activity: '/admin/activity',
      participants: '/admin/participants',
      email_templates: '/admin/emails',
      analytics: '/admin/analytics',
      class_settings: '/admin/settings',
      whatsapp: '/admin/whatsapp',
      activity_log: '/admin/audit',
      settings: '/admin/account',
      send_email: '/admin/dashboard',
    };
    const targetPath = pathMap[tab];
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Participant Actions
  const handleUpdateParticipant = async (id: string, updates: Partial<AdminParticipant>) => {
    const updated = await adminApi.updateParticipant(id, updates);
    setParticipants((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (activeDrawerParticipant?.id === id) {
      setActiveDrawerParticipant(updated);
    }
    fetchCoreData();
  };

  const handleChangeStatus = async (p: AdminParticipant, status: ParticipantStatus) => {
    await handleUpdateParticipant(p.id, { status });
  };

  const handleDeleteParticipant = async (p: AdminParticipant) => {
    if (!window.confirm(`Are you sure you want to delete participant ${p.full_name} (${p.email})?`)) {
      return;
    }
    try {
      await adminApi.deleteParticipant(p.id);
      setSelectedIds((prev) => prev.filter((id) => id !== p.id));
      if (activeDrawerParticipant?.id === p.id) {
        setActiveDrawerParticipant(null);
      }
      fetchParticipants();
      fetchCoreData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete participant');
    }
  };

  const handleOpenSingleEmail = (p: AdminParticipant) => {
    setEmailTargetParticipant(p);
    setIsEmailModalOpen(true);
  };

  const handleOpenBulkEmail = (ids: string[]) => {
    setSelectedIds(ids);
    setEmailTargetParticipant(null);
    setIsEmailModalOpen(true);
  };

  const handleSelectTemplateToCompose = (tmpl: EmailTemplate) => {
    setCurrentTab('participants');
    setIsEmailModalOpen(true);
  };

  const handleResendConfirmation = async (p: AdminParticipant) => {
    try {
      await adminApi.resendConfirmation(p.id);
      alert(`Admission pass confirmation email resent successfully to ${p.email}`);
      fetchParticipants();
      fetchCoreData();
    } catch (err: any) {
      alert(err.message || 'Failed to resend confirmation email');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await adminApi.downloadCSV({
        q: searchQuery,
        status: selectedStatus,
        device: selectedDevice,
        canva_experience: selectedExperience,
        source: selectedSource,
        learning_interest: selectedInterest,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to export CSV');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDevice('All');
    setSelectedExperience('All');
    setSelectedSource('All');
    setSelectedStatus('All');
    setSelectedInterest('All');
    setCurrentPage(1);
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      adminUser={adminUser}
      classSettings={classSettings}
      onLogout={onLogout}
      onViewLandingPage={onViewLandingPage}
    >
      {/* 1. Dashboard Overview */}
      {currentTab === 'dashboard' && (
        <AdminDashboardHome
          stats={stats}
          recentParticipants={(participants || []).slice(0, 8)}
          isLoading={isLoadingParticipants}
          onNavigateTab={handleSelectTab}
          onSelectParticipant={(p) => setActiveDrawerParticipant(p)}
          onDownloadCSV={handleDownloadCSV}
        />
      )}

      {/* 1b. Live Visitor & Heartbeat Monitor */}
      {currentTab === 'live_activity' && <AdminLiveActivityView />}

      {/* 2. Participants Database Table */}
      {currentTab === 'participants' && (
        <ParticipantTable
          participants={participants}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          isLoading={isLoadingParticipants}
          searchQuery={searchQuery}
          selectedDevice={selectedDevice}
          selectedExperience={selectedExperience}
          selectedSource={selectedSource}
          selectedStatus={selectedStatus}
          selectedInterest={selectedInterest}
          selectedIds={selectedIds}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onFilterChange={(key, val) => {
            if (key === 'status') setSelectedStatus(val);
            if (key === 'device') setSelectedDevice(val);
            if (key === 'canva_experience') setSelectedExperience(val);
            if (key === 'source') setSelectedSource(val);
            if (key === 'learning_interest') setSelectedInterest(val);
            setCurrentPage(1);
          }}
          onClearFilters={handleClearFilters}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          onToggleSelectId={(id) => {
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            );
          }}
          onSelectAllVisible={(ids) => setSelectedIds(ids)}
          onDeselectAll={() => setSelectedIds([])}
          onViewParticipant={(p) => setActiveDrawerParticipant(p)}
          onEditParticipant={(p) => setActiveDrawerParticipant(p)}
          onSendSingleEmail={handleOpenSingleEmail}
          onSendBulkEmail={handleOpenBulkEmail}
          onChangeStatus={handleChangeStatus}
          onDeleteParticipant={handleDeleteParticipant}
          onDownloadCSV={handleDownloadCSV}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenAddParticipant={() => setIsAddModalOpen(true)}
          onResendConfirmation={handleResendConfirmation}
        />
      )}

      {/* 3. Email Templates Library */}
      {currentTab === 'email_templates' && (
        <EmailTemplatesView
          templates={templates}
          classSettings={classSettings}
          onSelectTemplateToCompose={handleSelectTemplateToCompose}
          onRefreshTemplates={fetchCoreData}
        />
      )}

      {/* 4. Analytics & Ad Attribution */}
      {currentTab === 'analytics' && (
        <AnalyticsView stats={stats} isLoading={isLoadingParticipants} />
      )}

      {/* 5. Class Settings */}
      {currentTab === 'class_settings' && (
        <ClassSettingsView
          initialSettings={classSettings}
          templates={templates}
          onSettingsUpdated={(newS) => {
            setClassSettings(newS);
            fetchCoreData();
          }}
        />
      )}

      {/* 6. WhatsApp Community Manager */}
      {currentTab === 'whatsapp' && (
        <WhatsAppManagerView
          classSettings={classSettings}
          stats={stats}
          participants={participants}
          onSettingsUpdated={(newS) => setClassSettings(newS)}
          onRefreshData={() => {
            fetchParticipants();
            fetchCoreData();
          }}
        />
      )}

      {/* 7. Activity & Audit Trail */}
      {currentTab === 'activity_log' && (
        <AuditLogView
          logs={auditLogs}
          isLoading={false}
          onRefresh={fetchCoreData}
        />
      )}

      {/* 8. Settings & API Credentials */}
      {currentTab === 'settings' && (
        <AdminSettingsView
          adminUser={adminUser}
          onAccountUpdated={(updatedUser) => {
            setAdminUser(updatedUser);
            fetchCoreData();
          }}
        />
      )}

      {/* Participant Slide-Over Profile Drawer */}
      <ParticipantDetailDrawer
        participant={activeDrawerParticipant}
        isOpen={Boolean(activeDrawerParticipant)}
        onClose={() => setActiveDrawerParticipant(null)}
        onUpdate={handleUpdateParticipant}
        onDelete={handleDeleteParticipant}
        onSendEmail={handleOpenSingleEmail}
        onResendConfirmation={handleResendConfirmation}
      />

      {/* Email Composer Modal (Individual & Bulk) */}
      <EmailComposerModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        targetParticipant={emailTargetParticipant}
        bulkParticipantIds={
          selectedIds.length > 0 ? selectedIds : participants.map((p) => p.id)
        }
        totalEligibleCount={totalCount}
        templates={templates}
        classSettings={classSettings}
        onEmailSentSuccess={() => {
          fetchParticipants();
          fetchCoreData();
        }}
      />

      {/* CSV Import Modal */}
      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchParticipants();
          fetchCoreData();
        }}
      />

      {/* Manual Participant Enrollment Modal */}
      <AddParticipantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={() => {
          fetchParticipants();
          fetchCoreData();
        }}
      />
    </AdminLayout>
  );
};
