import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  Sparkles,
  ShieldCheck,
  FileBadge,
  LogOut,
  Clock,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ProfilePage() {
  const { user, logout, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignOut = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Campus SuperAdmin (Institutional Governance)';
    if (isDeptAdmin) return `${user?.departmentName || 'Department'} Administrator`;
    return 'Registered Student Member';
  };

  return (
    <div className="cc-page-container" style={{ maxWidth: '820px' }}>
      {/* Header */}
      <div className="cc-page-header-row">
        <div>
          <h1 className="cc-section-title">Institutional User Profile</h1>
          <p className="cc-section-subtitle">
            Authenticated session identity and academic registry details.
          </p>
        </div>

        <Button variant="danger" size="sm" icon={LogOut} onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <div className="cc-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#EEF2FF',
              color: '#4338CA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isStudent ? (
              <GraduationCap size={32} />
            ) : isSuperAdmin ? (
              <Sparkles size={32} />
            ) : (
              <Building2 size={32} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {user?.fullName || user?.name || 'Campus Member'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant={isSuperAdmin ? 'urgent' : isDeptAdmin ? 'inprogress' : 'resolved'}>
                {user?.role || 'Student'}
              </Badge>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {user?.registrationNumber || 'BIIT Official Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', paddingTop: '1.25rem' }}>
          <div className="cc-prop-item">
            <Mail size={18} className="text-muted" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>OFFICIAL EMAIL</span>
              <strong style={{ fontSize: '0.875rem', color: '#1E293B' }}>{user?.email || 'N/A'}</strong>
            </div>
          </div>

          <div className="cc-prop-item">
            <FileBadge size={18} className="text-muted" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>REGISTRATION ID / ROLL #</span>
              <strong style={{ fontSize: '0.875rem', color: '#1E293B' }}>{user?.registrationNumber || user?.regNo || 'N/A'}</strong>
            </div>
          </div>

          <div className="cc-prop-item">
            <Building2 size={18} className="text-muted" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>FACULTY / PROGRAM</span>
              <strong style={{ fontSize: '0.875rem', color: '#1E293B' }}>
                {user?.academicProgram || user?.departmentName || 'Faculty of Computing & Information Technology'}
              </strong>
            </div>
          </div>

          <div className="cc-prop-item">
            <ShieldCheck size={18} className="text-muted" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>ACCESS DESIGNATION</span>
              <strong style={{ fontSize: '0.875rem', color: '#1E293B' }}>{getRoleLabel()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="cc-card">
          <div className="cc-card-header">
            <div className="cc-header-title-flex">
              <ClipboardList size={18} />
              <h3 className="cc-card-title">Grievance Operations</h3>
            </div>
          </div>
          <div className="cc-card-body">
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0' }}>
              {isStudent
                ? 'View your lodged grievances, submit new dockets, or track SLA progress.'
                : 'Access the department triage queue or view campus-wide analytics.'}
            </p>
            <Link
              to={isStudent ? '/student/complaints' : '/admin/complaints'}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Open Grievance Desk <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="cc-card">
          <div className="cc-card-header">
            <div className="cc-header-title-flex">
              <Lock size={18} />
              <h3 className="cc-card-title">Security &amp; Encryption</h3>
            </div>
          </div>
          <div className="cc-card-body">
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0' }}>
              Your session is authenticated via 256-bit signed JSON Web Tokens (JWT) adhering to institutional security standards.
            </p>
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Session Active &amp; Validated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export { ProfilePage };
