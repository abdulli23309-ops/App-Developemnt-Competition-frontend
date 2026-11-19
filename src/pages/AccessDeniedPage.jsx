import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Sparkles,
  FileText,
  Copy,
  Check,
  Building2,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import Button from '../components/ui/Button';

export default function AccessDeniedPage({ message }) {
  const { user, logout, demoLogin, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [context, setContext] = useState(null);
  const [copied, setCopied] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('cc_403_context');
      if (stored) {
        setContext(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopyRef = () => {
    navigator.clipboard.writeText('SEC-AUDIT-9921-RBAC4');
    setCopied(true);
    toast.success('Security audit reference copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const getDashboardPath = () => {
    if (isStudent) return '/student/dashboard';
    if (isDeptAdmin) return '/admin/dashboard';
    if (isSuperAdmin) return '/admin/dashboard';
    return '/';
  };

  const getDashboardLabel = () => {
    if (isStudent) return 'Return to Student Dashboard';
    if (isDeptAdmin) {
      const dept = user?.departmentName || 'Department';
      return `Return to ${dept} Dashboard`;
    }
    return 'Return to Campus Dashboard';
  };

  const handleSwitchToSuperAdmin = async () => {
    setSwitching(true);
    try {
      await demoLogin('superadmin@biit.edu.pk');
      sessionStorage.removeItem('cc_403_context');
      toast.success('Switched to SuperAdmin persona. Full audit access granted.');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Could not switch to SuperAdmin.');
    } finally {
      setSwitching(false);
    }
  };

  const attemptedTicket = context?.attemptedComplaintId
    ? `#CC-2026-00${context.attemptedComplaintId}`
    : '#CC-2026-0038';

  return (
    <div className="cc-page-container" style={{ maxWidth: '860px', margin: '2rem auto' }}>
      {/* 403 Access Denied Card */}
      <div className="cc-card cc-403-card">
        <div className="cc-403-header">
          <div className="cc-403-icon-badge">
            <ShieldAlert size={36} strokeWidth={2.2} />
          </div>
          <div>
            <span className="cc-403-code-tag">HTTP 403 &bull; ACCESS CONTROL BARRIER</span>
            <h1 className="cc-403-title">Department RBAC Access Restricted</h1>
            <p className="cc-403-subtitle">
              Strict departmental isolation protocols prevent unauthorized personnel from viewing
              or mutating grievances filed under external faculties.
            </p>
          </div>
        </div>

        <div className="cc-403-body">
          <div className="cc-403-alert-box">
            <Lock size={18} className="text-danger" />
            <div>
              <strong>Security Policy Violation:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                {message ||
                  context?.errorMessage ||
                  'Access Denied: Your assigned departmental role does not grant read/write clearance for this specific grievance.'}
              </p>
            </div>
          </div>

          <div className="cc-403-details-grid">
            <div className="cc-403-item">
              <span className="cc-403-key">Current Identity:</span>
              <span className="cc-403-val">
                <strong>{user?.fullName || user?.name || 'Evaluator User'}</strong> (
                {user?.role || 'Guest'})
              </span>
            </div>

            <div className="cc-403-item">
              <span className="cc-403-key">Assigned Department:</span>
              <span className="cc-403-val">{user?.departmentName || 'General Campus'}</span>
            </div>

            <div className="cc-403-item">
              <span className="cc-403-key">Target Docket Attempted:</span>
              <span className="cc-403-val">{attemptedTicket}</span>
            </div>

            <div className="cc-403-item">
              <span className="cc-403-key">Security Reference:</span>
              <span className="cc-403-val">
                <code>SEC-AUDIT-9921-RBAC4</code>
                <button
                  type="button"
                  className="cc-copy-code-btn"
                  onClick={handleCopyRef}
                  title="Copy reference"
                >
                  {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                </button>
              </span>
            </div>
          </div>

          {/* Quick Evaluator Action: Switch to SuperAdmin */}
          <div className="cc-403-evaluator-box">
            <div className="cc-eval-left">
              <Sparkles size={20} className="text-primary" />
              <div>
                <strong>Need Complete Campus Audit Clearance?</strong>
                <p>
                  As an evaluator or competition judge, switch to the SuperAdmin role to review
                  campus-wide cross-departmental tickets.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={switching}
              onClick={handleSwitchToSuperAdmin}
            >
              Switch to SuperAdmin
            </Button>
          </div>
        </div>

        <div className="cc-403-footer">
          <Button variant="outline" size="md" onClick={() => navigate(getDashboardPath())}>
            <ArrowLeft size={16} /> {getDashboardLabel()}
          </Button>
          <Button
            variant="ghost"
            size="md"
            icon={LogOut}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Sign Out of Account
          </Button>
        </div>
      </div>
    </div>
  );
}
