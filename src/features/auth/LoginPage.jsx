import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/AuthPages.css';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  GraduationCap,
  BookOpen,
  Server,
  Zap,
  Clock,
  Compass,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const { login, demoLogin, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modals for credentials reminder & registrar assistance
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Student') {
        navigate('/student/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide university email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      toast.success(`Welcome back, ${res.user?.fullName || res.user?.name || 'User'}!`);
      if (res.user?.role === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(res.message);
      toast.error(res.message, 'Authentication Failed');
    }
  };

  const handleQuickDemoLogin = async (demoEmail, roleLabel) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setSubmitting(true);
    setError('');

    const res = await demoLogin(demoEmail);
    setSubmitting(false);

    if (res.success) {
      toast.success(`Signed in as ${roleLabel} (${res.user?.fullName || res.user?.name})`);
      if (res.user?.role === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(res.message);
      toast.error(res.message);
    }
  };

  return (
    <div className="login-split-page">
      <div className="login-split-container">
        
        {/* LEFT PANEL - CLEAN INSTITUTIONAL PRESENTATION */}
        <div className="login-brand-panel">
          <div className="brand-header-area">
            <div className="brand-logo-lockup">
              <div className="brand-logo-icon">
                <ShieldCheck size={26} strokeWidth={2.4} />
              </div>
              <div className="brand-title-column">
                <span className="brand-app-title">CampusConnect</span>
                <span className="brand-portal-subtitle">BIIT Student &amp; Administration Portal</span>
              </div>
            </div>
          </div>

          <div className="brand-hero-content">
            <h1 className="hero-main-title">
              Your Campus.<br />
              Your Voice.
            </h1>
            <p className="hero-lead-text">
              A central platform to submit complaints, track progress and connect with the right university department.
            </p>

            <div className="benefit-points-list">
              <div className="benefit-point-item">
                <div className="benefit-point-icon">
                  <Compass size={18} strokeWidth={2.2} />
                </div>
                <div className="benefit-point-text">
                  <span className="benefit-point-title">Easy Complaint Submission</span>
                  <span className="benefit-point-desc">Report campus issues through a simple, guided process.</span>
                </div>
              </div>

              <div className="benefit-point-item">
                <div className="benefit-point-icon">
                  <Clock size={18} strokeWidth={2.2} />
                </div>
                <div className="benefit-point-text">
                  <span className="benefit-point-title">Transparent Tracking</span>
                  <span className="benefit-point-desc">Follow complaint progress and receive departmental updates.</span>
                </div>
              </div>

              <div className="benefit-point-item">
                <div className="benefit-point-icon">
                  <CheckCircle2 size={18} strokeWidth={2.2} />
                </div>
                <div className="benefit-point-text">
                  <span className="benefit-point-title">Accountable Resolution</span>
                  <span className="benefit-point-desc">Departments can review, respond and resolve reported issues.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer-editorial">
            <span className="brand-institution-name">Barani Institute of Information Technology</span>
            <span className="brand-society-credit">BIIT Software Engineering Society &bull; 2026</span>
          </div>
        </div>

        {/* RIGHT PANEL - LOGIN & EVALUATOR DEMO ACCESS */}
        <div className="login-form-panel">
          <div className="form-header-badge">
            <span className="portal-badge">
              <ShieldCheck size={14} /> Official Portal Login
            </span>
          </div>

          <h2 className="login-title">Sign in to CampusConnect</h2>
          <p className="login-subtitle">
            Enter your university credentials below to access your grievance dashboard.
          </p>

          {/* Quick Demo Access Bar for Evaluators */}
          <div className="quick-demo-wrapper">
            <div className="quick-demo-header">
              <Zap size={14} className="quick-demo-icon" />
              <span>Instant Evaluator Access (1-Click)</span>
            </div>
            <div className="quick-demo-grid">
              <button
                type="button"
                className="quick-demo-pill"
                onClick={() => handleQuickDemoLogin('s.chen@student.biit.edu.pk', 'Student')}
                disabled={submitting}
                title="Log in as Student Sarah Chen"
              >
                <GraduationCap size={15} />
                <span>Student</span>
                <small>Sarah Chen</small>
              </button>
              <button
                type="button"
                className="quick-demo-pill"
                onClick={() => handleQuickDemoLogin('itlabs.admin@biit.edu.pk', 'IT Admin')}
                disabled={submitting}
                title="Log in as IT Labs Administrator"
              >
                <Server size={15} />
                <span>IT Dept</span>
                <small>Lab Admin</small>
              </button>
              <button
                type="button"
                className="quick-demo-pill"
                onClick={() => handleQuickDemoLogin('library.admin@biit.edu.pk', 'Library Admin')}
                disabled={submitting}
                title="Log in as Library Administrator"
              >
                <BookOpen size={15} />
                <span>Library</span>
                <small>Dr. Zahra</small>
              </button>
              <button
                type="button"
                className="quick-demo-pill"
                onClick={() => handleQuickDemoLogin('superadmin@biit.edu.pk', 'SuperAdmin')}
                disabled={submitting}
                title="Log in as Campus Super Administrator"
              >
                <Sparkles size={15} />
                <span>SuperAdmin</span>
                <small>Executive</small>
              </button>
            </div>
          </div>

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
                <label htmlFor="login-email">
                  University Email Address <span className="label-required-star">*</span>
                </label>
                <span className="label-hint">Institutional ID</span>
              </div>
              <div className="input-with-icon">
                <Mail size={17} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. s.chen@student.biit.edu.pk"
                  autoComplete="username"
                  required
                />
              </div>
              <span className="field-subnote">
                <HelpCircle size={12} /> Use your official university account address
              </span>
            </div>

            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor="login-password">
                  Account Password <span className="label-required-star">*</span>
                </label>
                <button
                  type="button"
                  className="forgot-link-btn"
                  onClick={() => setShowForgotModal(true)}
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
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
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="registrar-help"
              >
                Need help signing in?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={submitting}
              iconRight={ArrowRight}
            >
              Sign In to Portal
            </Button>
          </form>

          <div className="login-register-prompt">
            New student member at BIIT?{' '}
            <Link to="/register" className="register-strong-link">
              Register Student Account
            </Link>
          </div>

          <div className="login-mini-footer">
            <a href="#help" onClick={(e) => { e.preventDefault(); setShowHelpModal(true); }}>Registrar Helpdesk</a>
            <span>&bull;</span>
            <Link to="/system-status">System Telemetry</Link>
          </div>
        </div>

      </div>

      <div className="login-page-copyright">
        Barani Institute of Information Technology &bull; BIIT Software Engineering Society &bull; 2026
      </div>

      {/* Forgot Credentials Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Evaluator & Demo Credentials"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
          <p>
            For competition evaluation and grading, all pre-configured demo accounts share the password:
          </p>
          <div style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: '8px', fontFamily: 'monospace', fontWeight: 700, color: '#1E1B4B' }}>
            Password123!
          </div>
          <p style={{ marginTop: '0.5rem' }}>
            Available persona logins:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li><strong>Student:</strong> s.chen@student.biit.edu.pk</li>
            <li><strong>IT Labs Admin:</strong> itlabs.admin@biit.edu.pk</li>
            <li><strong>Library Admin:</strong> library.admin@biit.edu.pk</li>
            <li><strong>SuperAdmin:</strong> superadmin@biit.edu.pk</li>
          </ul>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="CampusConnect Registrar & Support"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
          <p>
            For official account onboarding, password resets, or identity verification queries, contact:
          </p>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
            <div><strong>BIIT Helpdesk:</strong> Room 204, Academic Block A</div>
            <div><strong>Direct Extension:</strong> +92 51 929-2144 (Ext 108)</div>
            <div><strong>Email:</strong> support@student.biit.edu.pk</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Hours: Monday &ndash; Friday, 08:30 AM &ndash; 04:30 PM PKT.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export { LoginPage };
