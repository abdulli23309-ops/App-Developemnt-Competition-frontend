import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Wifi,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import useConnectivityStatus from '../hooks/useConnectivityStatus';

export default function Home() {
  useEffect(() => {
    document.title = 'Dashboard - Competition Starter';
  }, []);

  const {
    frontendStatus,
    backendStatus,
    databaseStatus,
    lastChecked,
    isChecking,
    checkConnectivity,
  } = useConnectivityStatus();

  const statusLabel = (status) => {
    switch (status) {
      case 'success':
        return 'Operational';
      case 'failure':
        return 'Unavailable';
      case 'loading':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  return (
    <section className="page">
      <div className="card">
        <div className="dashboard-header">
          <div className="dashboard-brand">
            <Monitor size={28} />
            <div>
              <h1>APP DEVELOPMENT COMPETITION</h1>
              <p>Your competition starts here.</p>
            </div>
          </div>
          <button
            className="btn btn-outline"
            onClick={checkConnectivity}
            disabled={isChecking}
          >
            {isChecking ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
            Retry Check
          </button>
        </div>

        <div className="status-section">
          <h2>System Status</h2>
          <p className="status-subtitle">
            Last checked:{' '}
            {lastChecked ? new Date(lastChecked).toLocaleTimeString() : '—'}
          </p>

          <div className="status-grid">
            <StatusCard
              name="Frontend"
              icon={<Monitor />}
              status={frontendStatus}
              label={statusLabel(frontendStatus)}
            />
            <StatusCard
              name="Backend API"
              icon={<Wifi />}
              status={backendStatus}
              label={statusLabel(backendStatus)}
            />
            <StatusCard
              name="Database"
              icon={<Database />}
              status={databaseStatus}
              label={statusLabel(databaseStatus)}
            />
          </div>
        </div>

        <div className="dashboard-footer">
          <p>
            This is a temporary starter dashboard. Replace with the actual
            competition application once the problem statement is announced.
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatusCard({ name, icon: Icon, status, label }) {
  return (
    <div className={`status-card status-card-${status}`}>
      <div className="status-card-header">
        <div className="status-card-icon">
          <Icon size={20} />
        </div>
        <span className="status-card-name">{name}</span>
      </div>
      <div className="status-card-body">
        <StatusIndicator status={status} label={label} />
        <span className="status-card-label">{label}</span>
      </div>
    </div>
  );
}

function StatusIndicator({ status, label }) {
  const Icon =
    status === 'success'
      ? CheckCircle
      : status === 'failure'
        ? XCircle
        : Loader2;
  return (
    <span
      className={`status-badge status-badge-${status}`}
      aria-label={label}
    >
      {status === 'loading' ? (
        <Icon size={14} className="spin" />
      ) : (
        <Icon size={14} />
      )}
    </span>
  );
}

