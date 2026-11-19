import React, { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/AuthPages.css';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  FileBadge,
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from './AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [academicProgram, setAcademicProgram] = useState('BS Software Engineering (Faculty of Computing)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fullNameId = useId();
  const emailId = useId();
  const regNoId = useId();
  const programId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  // Password Strength Calculation
  const hasMinLen = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strengthScore = 0;
  if (hasMinLen) strengthScore++;
  if (hasNumber) strengthScore++;
  if (hasSymbol) strengthScore++;

  const strengthLabels = ['Too short', 'Weak', 'Medium', 'Strong'];
  const strengthColors = ['#94A3B8', '#EF4444', '#F59E0B', '#10B981'];
  const currentStrengthLabel = password ? strengthLabels[strengthScore] : '';

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please provide all mandatory fields.');
      return;
    }

    if (!hasMinLen) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the CampusConnect Code of Conduct.');
      return;
    }

    setSubmitting(true);
    setError('');

    const res = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      registrationNumber: registrationNumber.trim(),
      academicProgram: academicProgram.trim(),
      password
    });

    setSubmitting(false);

    if (res.success) {
      navigate('/student/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="register-split-page">
      <div className="register-split-container">
        
        {/* LEFT PANEL - LAVENDER/INDIGO BRANDING */}
        <div className="register-brand-panel">
          <div className="brand-logo-lockup">
            <div className="brand-logo-icon">
              <ShieldCheck size={26} strokeWidth={2.5} />
            </div>
            <div>
              <div className="brand-title-row">
                <span className="brand-app-title">CampusConnect</span>
                <span className="brand-portal-tag">BIIT PORTAL</span>
              </div>
              <span className="brand-sub-institution">Barani Institute of Information Technology</span>
            </div>
          </div>

          <div className="brand-hero-content">
            <span className="hero-category-tag">INSTITUTIONAL GOVERNANCE</span>
            <h1 className="hero-main-title">
              Your Campus.<br />
              Your Voice.<br />
              Your Connect.
            </h1>
            <p className="hero-lead-text">
              Official collegiate dispute facilitation and grievance redressal system. Empowering student safety, integrity, and swift administrative accountability.
            </p>

            <div className="feature-cards-column">
              <div className="register-feature-card">
                <div className="feature-card-header-row">
                  <div className="feature-icon-box">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="feature-card-body">
                    <div className="card-title-badge-row">
                      <h4>Whistleblower Privacy Guarantee</h4>
                      <span className="security-code-badge">256-BIT</span>
                    </div>
                    <p>Strict end-to-end anonymity protocols shield identity from departmental reprimands.</p>
                  </div>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="feature-card-header-row">
                  <div className="feature-icon-box">
                    <Sparkles size={18} />
                  </div>
                  <div className="feature-card-body">
                    <h4>Direct Department Dispatch</h4>
                    <p>Instantaneous escalation routing to Academic Deans, IT Directors, or Discipline Boards.</p>
                  </div>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="feature-card-header-row">
                  <div className="feature-icon-box">
                    <Award size={18} />
                  </div>
                  <div className="feature-card-body">
                    <h4>Official BIIT Accreditation &check;</h4>
                    <p>Recognized under statutory provisions of the Federal Academic Ombudsman Directive.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer-row">
            <span className="compliance-tag">HEC Chartered Higher Ed Compliance</span>
            <span className="sec-version">SEC-2026-V4</span>
          </div>
        </div>

        {/* RIGHT PANEL - REGISTRATION FORM */}
        <div className="register-form-panel">
          <div className="form-header-badge">
            <span className="onboarding-tag">INSTITUTIONAL ONBOARDING</span>
            <span className="session-pill">
              <span className="live-dot" /> Session Fall 2026
            </span>
          </div>

          <h2 className="register-title">Student Registration</h2>
          <p className="register-subtitle">
            Enter your accredited institutional credentials to verify enrollment status.
          </p>

          {error && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form-element">
            {/* FULL NAME */}
            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor={fullNameId}>Full Legal Name *</label>
                <span className="label-hint">As per official university ID</span>
              </div>
              <div className="input-with-icon">
                <User size={17} className="input-icon" />
                <input
                  id={fullNameId}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  required
                />
              </div>
            </div>

            {/* EMAIL & REG NO ROW */}
            <div className="form-grid-2col">
              <div className="form-group-custom">
                <div className="label-row">
                  <label htmlFor={emailId}>University Email *</label>
                </div>
                <div className="input-with-icon">
                  <Mail size={17} className="input-icon" />
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="s.chen@student.biit.edu.pk"
                    required
                  />
                </div>
                <span className="field-subnote">Allowed: @student.biit.edu.pk or valid email</span>
              </div>

              <div className="form-group-custom">
                <div className="label-row">
                  <label htmlFor={regNoId}>Registration Number *</label>
                  {registrationNumber && <CheckCircle2 size={14} className="valid-green" />}
                </div>
                <div className="input-with-icon">
                  <FileBadge size={17} className="input-icon" />
                  <input
                    id={regNoId}
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="BIIT-2023-SE-042"
                    required
                  />
                </div>
                <span className="field-subnote">Pattern: BIIT-YYYY-PROG-XXX</span>
              </div>
            </div>

            {/* ACADEMIC PROGRAM */}
            <div className="form-group-custom">
              <label htmlFor={programId}>Academic Program / Department *</label>
              <div className="select-wrapper">
                <Building2 size={17} className="input-icon" />
                <select
                  id={programId}
                  value={academicProgram}
                  onChange={(e) => setAcademicProgram(e.target.value)}
                  required
                >
                  <option value="BS Software Engineering (Faculty of Computing)">BS Software Engineering (Faculty of Computing)</option>
                  <option value="BS Computer Science (Faculty of Computing)">BS Computer Science (Faculty of Computing)</option>
                  <option value="BS Information Technology">BS Information Technology</option>
                  <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                  <option value="BBA / Management Sciences">BBA / Management Sciences</option>
                </select>
              </div>
            </div>

            {/* PASSWORD & CONFIRM PASSWORD */}
            <div className="form-grid-2col">
              <div className="form-group-custom">
                <div className="label-row">
                  <label htmlFor={passwordId}>Password *</label>
                  {currentStrengthLabel && (
                    <span className="strength-badge" style={{ color: strengthColors[strengthScore] }}>
                      {currentStrengthLabel}
                    </span>
                  )}
                </div>
                <div className="input-with-icon">
                  <Lock size={17} className="input-icon" />
                  <input
                    id={passwordId}
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

              <div className="form-group-custom">
                <div className="label-row">
                  <label htmlFor={confirmPasswordId}>Confirm Password *</label>
                  {passwordsMatch && (
                    <span className="match-badge">
                      &check; Matches
                    </span>
                  )}
                </div>
                <div className="input-with-icon">
                  <Lock size={17} className="input-icon" />
                  <input
                    id={confirmPasswordId}
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </div>
                <span className="field-subnote">Re-enter your password to prevent typo lockouts.</span>
              </div>
            </div>

            {/* PASSWORD STRENGTH BARS & CHECKLIST */}
            <div className="password-checklist-block">
              <div className="strength-bars-row">
                <div className={`strength-bar ${strengthScore >= 1 ? 'bar-filled' : ''}`} style={{ backgroundColor: strengthScore >= 1 ? strengthColors[strengthScore] : undefined }} />
                <div className={`strength-bar ${strengthScore >= 2 ? 'bar-filled' : ''}`} style={{ backgroundColor: strengthScore >= 2 ? strengthColors[strengthScore] : undefined }} />
                <div className={`strength-bar ${strengthScore >= 3 ? 'bar-filled' : ''}`} style={{ backgroundColor: strengthScore >= 3 ? strengthColors[strengthScore] : undefined }} />
              </div>
              <div className="checklist-items">
                <span className={`check-rule ${hasMinLen ? 'rule-passed' : ''}`}>
                  {hasMinLen ? '✓' : '•'} 8+ chars
                </span>
                <span className={`check-rule ${hasNumber ? 'rule-passed' : ''}`}>
                  {hasNumber ? '✓' : '•'} Number
                </span>
                <span className={`check-rule ${hasSymbol ? 'rule-passed' : ''}`}>
                  {hasSymbol ? '✓' : '•'} Symbol
                </span>
              </div>
            </div>

            {/* TERMS CHECKBOX */}
            <div className="terms-checkbox-box">
              <label className="checkbox-label terms-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                />
                <span>
                  I certify that all provided details are authentic and agree to the{' '}
                  <a href="#conduct">CampusConnect Code of Conduct</a> and{' '}
                  <a href="#terms">Disciplinary Terms</a>.
                  <small className="terms-disclaimer">
                    False reporting or forged identification constitutes formal misconduct under Clause 14-B.
                  </small>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="login-submit-button"
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="login-register-prompt">
            Already have an institutional account?{' '}
            <Link to="/login" className="register-strong-link">
              Sign in
            </Link>
          </div>
        </div>

      </div>

      <div className="login-page-copyright">
        &copy; 2026 CampusConnect Dispute Resolution System. Institutional Oversight &amp; Compliance Portal.
      </div>
    </div>
  );
}
