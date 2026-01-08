import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import MFAPage from '@/pages/auth/MFAPage';

// Module Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import IngestionListPage from '@/pages/ingestion/IngestionListPage';
import IngestionUploadPage from '@/pages/ingestion/IngestionUploadPage';
import RuleEngineListPage from '@/pages/rules/RuleEngineListPage';
import RuleEditorPage from '@/pages/rules/RuleEditorPage';
import MatchingDashboardPage from '@/pages/matching/MatchingDashboardPage';
import MatchedRecordsPage from '@/pages/matching/MatchedRecordsPage';
import UnmatchedRecordsPage from '@/pages/matching/UnmatchedRecordsPage';
import ExceptionsQueuePage from '@/pages/exceptions/ExceptionsQueuePage';
import ExceptionDetailPage from '@/pages/exceptions/ExceptionDetailPage';
import ApprovalsPage from '@/pages/workflow/ApprovalsPage';
import SettlementDashboardPage from '@/pages/settlement/SettlementDashboardPage';
import SettlementBatchesPage from '@/pages/settlement/SettlementBatchesPage';
import GLPostingListPage from '@/pages/gl-posting/GLPostingListPage';
import GLJournalDetailPage from '@/pages/gl-posting/GLJournalDetailPage';
import ReportsListPage from '@/pages/reports/ReportsListPage';
import ReportSchedulerPage from '@/pages/reports/ReportSchedulerPage';
import AuditLogPage from '@/pages/audit/AuditLogPage';
import UsersPage from '@/pages/admin/UsersPage';
import RolesPage from '@/pages/admin/RolesPage';
import PartnersPage from '@/pages/admin/PartnersPage';
import SystemConfigPage from '@/pages/admin/SystemConfigPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="mfa" element={<MFAPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Ingestion Module */}
        <Route path="ingestion">
          <Route index element={<IngestionListPage />} />
          <Route path="upload" element={<IngestionUploadPage />} />
        </Route>

        {/* Rule Engine */}
        <Route path="rules">
          <Route index element={<RuleEngineListPage />} />
          <Route path="new" element={<RuleEditorPage />} />
          <Route path=":ruleId/edit" element={<RuleEditorPage />} />
        </Route>

        {/* Matching Module */}
        <Route path="matching">
          <Route index element={<MatchingDashboardPage />} />
          <Route path="matched" element={<MatchedRecordsPage />} />
          <Route path="unmatched" element={<UnmatchedRecordsPage />} />
        </Route>

        {/* Exceptions */}
        <Route path="exceptions">
          <Route index element={<ExceptionsQueuePage />} />
          <Route path=":exceptionId" element={<ExceptionDetailPage />} />
        </Route>

        {/* Workflow/Approvals */}
        <Route path="approvals" element={<ApprovalsPage />} />

        {/* Settlement */}
        <Route path="settlement">
          <Route index element={<SettlementDashboardPage />} />
          <Route path="batches" element={<SettlementBatchesPage />} />
        </Route>

        {/* GL Posting */}
        <Route path="gl-posting">
          <Route index element={<GLPostingListPage />} />
          <Route path=":journalId" element={<GLJournalDetailPage />} />
        </Route>

        {/* Reports */}
        <Route path="reports">
          <Route index element={<ReportsListPage />} />
          <Route path="scheduler" element={<ReportSchedulerPage />} />
        </Route>

        {/* Audit Log */}
        <Route path="audit" element={<AuditLogPage />} />

        {/* Admin Module */}
        <Route path="admin">
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="system" element={<SystemConfigPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
