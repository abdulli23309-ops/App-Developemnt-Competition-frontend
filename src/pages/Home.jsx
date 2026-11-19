import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Wifi,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import AuthContext from '../features/auth/AuthContext';
import StudentDashboard from '../features/complaints/StudentDashboard';
import DeptAdminDashboard from '../features/admin/DeptAdminDashboard';
import SuperAdminDashboard from '../features/admin/SuperAdminDashboard';
import LoginPage from '../features/auth/LoginPage';
import useConnectivityStatus from '../hooks/useConnectivityStatus';
import IconRenderer from '../components/ui/IconRenderer';

export default function Home() {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const {
    frontendStatus,
    backendStatus,
    databaseStatus,
    lastChecked,
    isChecking,
    checkConnectivity,
  } = useConnectivityStatus();

  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    document.title = 'CampusConnect • Smart Campus Management';
  }, []);

  const statusLabel = (status) => {
    switch (status) {
      case 'success':
        return 'Operational';
      case 'failure':
        return 'Unavailable';
      case 'loading':
        return 'Checking...';
      case 'idle':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  // If user is authenticated, route to their role-specific dashboard
  if (user) {
    if (user.role === 'DeptAdmin') {
      return <DeptAdminDashboard />;
    }
    if (user.role === 'SuperAdmin') {
      return <SuperAdminDashboard />;
    }
    return <StudentDashboard />;
  }

  // If unauthenticated: render Login Page + System Diagnostics Bar
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <LoginPage />

      {/* System Status Diagnostic Bar for Competition Judges & E2E Validation */}
      <section className="page" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="dashboard-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconRenderer icon={Monitor} size={20} />
              <div>
                <h1 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
                  APP DEVELOPMENT COMPETITION
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                  Your competition starts here.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={checkConnectivity}
              disabled={isChecking}
              aria-label="Retry connectivity check"
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconRenderer
                icon={isChecking ? Loader2 : RefreshCw}
                size={14}
                className={isChecking ? 'spin' : ''}
              />
              <span>{isChecking ? 'Checking...' : 'Retry Check'}</span>
            </button>
          </div>

          <div className="status-section">
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>System Status</h2>
            <p className="status-subtitle" style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '0 0 0.75rem 0' }}>
              Last checked:{' '}
              {lastChecked ? new Date(lastChecked).toLocaleTimeString() : '—'}
            </p>

            <div className="status-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <StatusCard
                name="Frontend"
                icon={Monitor}
                status={frontendStatus}
                label={statusLabel(frontendStatus)}
              />
              <StatusCard
                name="Backend API"
                icon={Wifi}
                status={backendStatus}
                label={statusLabel(backendStatus)}
              />
              <StatusCard
                name="Database"
                icon={Database}
                status={databaseStatus}
                label={statusLabel(databaseStatus)}
              />
            </div>
          </div>

          <div className="dashboard-footer" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <p style={{ margin: 0, color: '#64748B' }}>
              Live connection to ASP.NET Core .NET 10 + SQL Server API.
            </p>
            <Link
              to="/"
              className="btn btn-primary"
              onClick={checkConnectivity}
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
            >
              Refresh Status
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusCard({ name, icon, status, label }) {
  const safeStatus = status || 'idle';
  const safeLabel = typeof label === 'string' ? label : 'Unknown';

  return (
    <div className={`status-card status-card-${safeStatus}`} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
      <div className="status-card-header" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <div className="status-card-icon">
          <IconRenderer icon={icon} size={15} />
        </div>
        <span className="status-card-name" style={{ fontSize: '0.72rem', fontWeight: 700 }}>{name}</span>
      </div>
      <div className="status-card-body" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <StatusIndicator status={safeStatus} label={safeLabel} />
        <span className="status-card-label" style={{ fontSize: '0.68rem', color: '#64748B' }}>{safeLabel}</span>
      </div>
    </div>
  );
}

function StatusIndicator({ status, label }) {
  const getIcon = () => {
    switch (status) {
      case 'success':
        return CheckCircle;
      case 'failure':
        return XCircle;
      case 'loading':
      case 'idle':
      default:
        return Loader2;
    }
  };

  const isSpinning = status === 'loading';

  return (
    <span
      className={`status-badge status-badge-${status}`}
      aria-label={label}
    >
      <IconRenderer
        icon={getIcon()}
        size={12}
        className={isSpinning ? 'spin' : ''}
      />
    </span>
  );
}
