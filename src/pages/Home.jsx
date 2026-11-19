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
      <section className="page" style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '0 1rem 2rem' }}>
        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="dashboard-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconRenderer icon={Monitor} size={20} />
              <div>
                <h1 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
                  APP DEVELOPMENT COMPETITION
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                  System Status &bull; Diagnostic Telemetry
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={checkConnectivity}
              disabled={isChecking}
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconRenderer icon={RefreshCw} size={13} className={isChecking ? 'spin' : ''} />
              Retry Check
            </button>
          </div>

          <div className="status-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div className="status-card" style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Frontend</div>
              <span className={`status-pill status-${frontendStatus}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {statusLabel(frontendStatus)}
              </span>
            </div>

            <div className="status-card" style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Backend API</div>
              <span className={`status-pill status-${backendStatus}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {statusLabel(backendStatus)}
              </span>
            </div>

            <div className="status-card" style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Database</div>
              <span className={`status-pill status-${databaseStatus}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {statusLabel(databaseStatus)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
            <Link to="/system-status" style={{ fontSize: '0.75rem', color: '#4338CA', textDecoration: 'none', fontWeight: 600 }}>
              Refresh Status &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
