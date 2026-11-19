import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/AuthPages.css';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide email and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    const res = await login(email.trim(), password, rememberMe);
    setSubmitting(false);

    if (res.success) {
      if (res.user?.role === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="login-split-page">
      <div className="login-split-container">
        
        {/* LEFT PANEL - BRANDING */}
        <div className="login-brand-panel">
          <div className="brand-header-area">
            <div className="brand-logo-lockup">
              <div className="brand-logo-icon">
                <ShieldCheck size={26} strokeWidth={2.5} />
              </div>
              <div className="brand-title-column">
                <span className="brand-app-title">CampusConnect</span>
                <span className="brand-sub-badge">INSTITUTIONAL DISPUTE SYSTEM</span>
              </div>
            </div>
            <div className="competition-pill">
              <span className="live-dot" />
              <span>BIIT Dev Competition 2026</span>
            </div>
          </div>

          <div className="brand-hero-content">
            <span className="hero-category-tag">OPERATIONAL GOVERNANCE PORTAL</span>
            <h1 className="hero-main-title">
              Your Campus.<br />
              Your Voice.<br />
              Your Connect.
            </h1>
            <p className="hero-lead-text">
              A centralized grievance resolution &amp; campus operations ecosystem connecting students, departmental technicians, and university governance.
            </p>

            <div className="feature-cards-column">
              <div className="hero-feature-card">
                <div className="feature-card-icon">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4>94.8% SLA Resolution Rate</h4>
                  <p>Across IT, Cafeteria, Labs, and Library faculties.</p>
                </div>
              </div>

              <div className="hero-feature-card">
                <div className="feature-card-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4>Whistleblower-Grade Anonymity</h4>
                  <p>100% blind grievance submission with cryptographic tracking IDs.</p>
                </div>
              </div>

              <div className="hero-feature-card">
                <div className="feature-card-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4>Omnichannel Escalation Matrix</h4>
                  <p>Instant routing to department deans upon 48-hour inactivity.</p>
                </div>
              </div>
            </div>

            <div className="live-resolution-ticker">
              <span className="ticker-dot" />
              <span>Latest Resolution: <strong>Lab 3 GPU Cluster restored</strong> &bull; 38m ago</span>
            </div>
          </div>

          <div className="brand-footer-row">
            <span>&copy; BIIT Software Engineering Society</span>
            <span className="encrypted-badge">
              <Lock size={12} /> SSO &amp; 256-bit Encrypted Portal
            </span>
          </div>
        </div>

        {/* RIGHT PANEL - LOGIN */}
        <div className="login-form-panel">
          <div className="form-header-badge">
            <span className="portal-badge">
              <ShieldCheck size={14} /> Student &amp; Faculty Portal
            </span>
          </div>

          <h2 className="login-title">Sign in to CampusConnect</h2>
          <p className="login-subtitle">
            Enter your official university credentials below to access the institutional grievance system.
          </p>

          {error && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="login-form-element">
            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor="login-email">University Email or Student ID</label>
                <span className="label-hint">e.g. s.chen@student.biit.edu.pk</span>
              </div>
              <div className="input-with-icon">
                <Mail size={17} className="input-icon" />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.chen@student.biit.edu.pk"
                  required
                />
              </div>
              <span className="field-subnote">
                <HelpCircle size={12} /> Use your official institutional address (<code>@student.biit.edu.pk</code> or <code>@biit.edu.pk</code>)
              </span>
            </div>

            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor="login-password">Access Password</label>
                <button
                  type="button"
                  className="forgot-link-btn"
                  onClick={() => alert('For competition access, demo passwords are: Password123!')}
                >
                  Forgot credentials?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={17} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="remember-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this workstation for 30 days</span>
              </label>
              <a href="#help" onClick={(e) => { e.preventDefault(); alert('Please contact BIIT Helpdesk or student administration.'); }} className="registrar-help">
                Need registrar help?
              </a>
            </div>

            <button
              type="submit"
              className="login-submit-button"
              disabled={submitting}
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="login-register-prompt">
            New student or faculty member at BIIT?{' '}
            <Link to="/register" className="register-strong-link">
              Register Student Account
            </Link>
          </div>

          <div className="login-mini-footer">
            <a href="#privacy">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#terms">Acceptable Use Policy</a>
            <span>&bull;</span>
            <a href="#sla">Campus Resolution SLA</a>
          </div>
        </div>

      </div>

      <div className="login-page-copyright">
        &copy; 2026 CampusConnect Dispute Resolution System. Institutional Oversight &amp; Compliance Portal.
      </div>
    </div>
  );
}
