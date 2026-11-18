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
import IconRenderer from '../components/common/IconRenderer';

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
      case 'idle':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <section className="page">
      <div className="card">
        <div className="dashboard-header">
          <div className="dashboard-brand">
            <IconRenderer icon={Monitor} size={28} />
            <div>
              <h1>APP DEVELOPMENT COMPETITION</h1>
              <p>Your competition starts here.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={checkConnectivity}
            disabled={isChecking}
            aria-label="Retry connectivity check"
          >
            <IconRenderer
              icon={isChecking ? Loader2 : RefreshCw}
              size={16}
              className={isChecking ? 'spin' : ''}
            />
            {isChecking ? 'Checking...' : 'Retry Check'}
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

        <div className="dashboard-footer">
          <p>
            This is a temporary starter dashboard. Replace with the actual
            competition application once the problem statement is announced.
          </p>
          <Link
            to="/"
            className="btn btn-primary"
            onClick={checkConnectivity}
          >
            Refresh Status
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatusCard({ name, icon, status, label }) {
  const safeStatus = status || 'idle';
  const safeLabel = typeof label === 'string' ? label : 'Unknown';

  return (
    <div className={`status-card status-card-${safeStatus}`}>
      <div className="status-card-header">
        <div className="status-card-icon">
          <IconRenderer icon={icon} size={20} />
        </div>
        <span className="status-card-name">{name}</span>
      </div>
      <div className="status-card-body">
        <StatusIndicator status={safeStatus} label={safeLabel} />
        <span className="status-card-label">{safeLabel}</span>
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
        size={14}
        className={isSpinning ? 'spin' : ''}
      />
    </span>
  );
}
