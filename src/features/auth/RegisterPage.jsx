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
  Sparkles,
  BookOpen,
  GraduationCap,
  ChevronDown,
  Check,
  X,
  Compass,
  Clock,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [academicProgram, setAcademicProgram] = useState('BS Software Engineering');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Strong'];
  const strengthColors = ['#94A3B8', '#EF4444', '#F59E0B', '#10B981'];
  const currentStrengthLabel = password ? strengthLabels[strengthScore] : '';
  const currentStrengthColor = password ? strengthColors[strengthScore] : '#94A3B8';

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

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
      setError('You must accept the CampusConnect Student Code of Conduct.');
      return;
    }

    setSubmitting(true);
    setError('');

    const res = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      registrationNumber: registrationNumber.trim(),
      academicProgram: academicProgram.trim(),
      password,
    });

    setSubmitting(false);

    if (res.success) {
      toast.success('Registration successful! Welcome to CampusConnect.');
      navigate('/student/dashboard');
    } else {
      setError(res.message);
      toast.error(res.message, 'Registration Failed');
    }
  };

  return (
    <div className="register-split-page">
      <div className="register-split-container">
        
        {/* LEFT PANEL - CLEAN INSTITUTIONAL PRESENTATION */}
        <div className="register-brand-panel">
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
              Student Account<br />
              Registration
            </h1>
            <p className="hero-lead-text">
              Join your campus community to file complaints, monitor progress and connect directly with university departments.
            </p>

            <div className="benefit-points-list">
              <div className="benefit-point-item">
                <div className="benefit-point-icon">
                  <Compass size={18} strokeWidth={2.2} />
                </div>
                <div className="benefit-point-text">
                  <span className="benefit-point-title">Official Student Verification</span>
                  <span className="benefit-point-desc">Link your registration roll number for authenticated grievance logging.</span>
                </div>
              </div>

              <div className="benefit-point-item">
                <div className="benefit-point-icon">
                  <Clock size={18} strokeWidth={2.2} />
                </div>
                <div className="benefit-point-text">
                  <span className="benefit-point-title">Transparent Department Routing</span>
                  <span className="benefit-point-desc">Direct dispatch to IT Labs, Library, Cafeteria, and Academic faculties.</span>
                </div>
              </div>

              <div className="benefit-point-item">
                <div className="benefit-point-icon">
                  <CheckCircle2 size={18} strokeWidth={2.2} />
                </div>
                <div className="benefit-point-text">
                  <span className="benefit-point-title">Continuous Resolution Updates</span>
                  <span className="benefit-point-desc">Receive notifications as your complaint moves through investigation.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer-editorial">
            <span className="brand-institution-name">Barani Institute of Information Technology</span>
            <span className="brand-society-credit">BIIT Software Engineering Society &bull; 2026</span>
          </div>
        </div>

        {/* RIGHT PANEL - REFINED EDITORIAL REGISTRATION FORM */}
        <div className="register-form-panel">
          <div className="form-header-badge">
            <span className="portal-badge">
              <GraduationCap size={14} /> Student Registration
            </span>
          </div>

          <h2 className="register-title">Register as Student</h2>
          <p className="register-subtitle">
            Complete the form below to create your student portal account.
          </p>

          {error && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form-element">
            
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="auth-section-divider">
              <span className="auth-section-label">1. Personal Information</span>
              <div className="auth-section-line" />
            </div>

            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor={fullNameId}>
                  Full Name <span className="label-required-star">*</span>
                </label>
                <span className="label-hint">Official Student Name</span>
              </div>
              <div className="input-with-icon">
                <User size={17} className="input-icon" />
                <input
                  id={fullNameId}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor={emailId}>
                  University Email Address <span className="label-required-star">*</span>
                </label>
                <span className="label-hint">Institutional Email</span>
              </div>
              <div className="input-with-icon">
                <Mail size={17} className="input-icon" />
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. s.chen@student.biit.edu.pk"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* SECTION 2: STUDENT INFORMATION */}
            <div className="auth-section-divider">
              <span className="auth-section-label">2. Student Information</span>
              <div className="auth-section-line" />
            </div>

            <div className="form-grid-2col">
              <div className="form-group-custom">
                <div className="label-row">
                  <label htmlFor={regNoId}>Registration Number</label>
                </div>
                <div className="input-with-icon">
                  <Building2 size={17} className="input-icon" />
                  <input
                    id={regNoId}
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. BIIT-2023-SE-042"
                  />
                </div>
                <span className="field-subnote">Format: <code>BIIT-YYYY-PROG-XXX</code></span>
              </div>

              <div className="form-group-custom">
                <div className="label-row">
                  <label htmlFor={programId}>Academic Department</label>
                </div>
                <div className="select-wrapper">
                  <BookOpen size={17} className="input-icon" />
                  <select
                    id={programId}
                    value={academicProgram}
                    onChange={(e) => setAcademicProgram(e.target.value)}
                    className="auth-select-control"
                  >
                    <option value="BS Software Engineering">BS Software Engineering</option>
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                    <option value="BS Data Science">BS Data Science</option>
                    <option value="BS Information Technology">BS Information Technology</option>
                    <option value="BBA Business Administration">BBA Business Administration</option>
                    <option value="Other Academic Department">Other Academic Department</option>
                  </select>
                  <div className="select-chevron-icon">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ACCOUNT SECURITY */}
            <div className="auth-section-divider">
              <span className="auth-section-label">3. Account Security</span>
              <div className="auth-section-line" />
            </div>

            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor={passwordId}>
                  Account Password <span className="label-required-star">*</span>
                </label>
                {password && (
                  <span className="strength-score-text" style={{ color: currentStrengthColor }}>
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
                  placeholder="Minimum 8 characters with numbers &amp; symbols"
                  autoComplete="new-password"
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

              {/* Password Strength Meter & Requirement Checklist */}
              {password.length > 0 && (
                <div className="password-checklist-block">
                  <div className="strength-bars-row">
                    <div className="strength-bar" style={{ backgroundColor: strengthScore >= 1 ? currentStrengthColor : '#E2E8F0' }} />
                    <div className="strength-bar" style={{ backgroundColor: strengthScore >= 2 ? currentStrengthColor : '#E2E8F0' }} />
                    <div className="strength-bar" style={{ backgroundColor: strengthScore >= 3 ? currentStrengthColor : '#E2E8F0' }} />
                  </div>
                  <div className="checklist-items">
                    <span className={`check-rule ${hasMinLen ? 'rule-passed' : ''}`}>
                      {hasMinLen ? <Check size={12} strokeWidth={3} /> : <span style={{ fontSize: 10 }}>&bull;</span>} 8+ characters
                    </span>
                    <span className={`check-rule ${hasNumber ? 'rule-passed' : ''}`}>
                      {hasNumber ? <Check size={12} strokeWidth={3} /> : <span style={{ fontSize: 10 }}>&bull;</span>} Contains number
                    </span>
                    <span className={`check-rule ${hasSymbol ? 'rule-passed' : ''}`}>
                      {hasSymbol ? <Check size={12} strokeWidth={3} /> : <span style={{ fontSize: 10 }}>&bull;</span>} Special symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group-custom">
              <div className="label-row">
                <label htmlFor={confirmPasswordId}>
                  Confirm Password <span className="label-required-star">*</span>
                </label>
                {passwordsMatch && (
                  <span className="match-feedback-badge matched">
                    <Check size={13} strokeWidth={2.5} /> Passwords match
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="match-feedback-badge mismatch">
                    <X size={13} strokeWidth={2.5} /> Passwords do not match
                  </span>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={17} className="input-icon" />
                <input
                  id={confirmPasswordId}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password to confirm"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* CODE OF CONDUCT / TERMS CHECKBOX */}
            <div className="terms-checkbox-box">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                />
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    className="terms-link-btn"
                    onClick={() => setShowTermsModal(true)}
                  >
                    Student Code of Conduct
                  </button>{' '}
                  and responsible grievance usage policy.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={submitting}
              iconRight={ArrowRight}
            >
              Create Student Account
            </Button>
          </form>

          <div className="login-register-prompt">
            Already have an active student account?{' '}
            <Link to="/login" className="register-strong-link">
              Sign In to Account
            </Link>
          </div>
        </div>

      </div>

      <div className="login-page-copyright">
        Barani Institute of Information Technology &bull; BIIT Software Engineering Society &bull; 2026
      </div>

      {/* Student Code of Conduct Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="CampusConnect Student Code of Conduct"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#334155' }}>
          <p>
            By registering a student account on CampusConnect, you affirm your commitment to ethical and responsible campus communication:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Factual Submissions:</strong> File genuine campus grievances regarding infrastructure, academic resources, cafeteria hygiene, or lab facilities.</li>
            <li><strong>Respectful Discourse:</strong> Use professional, constructive language in all ticket descriptions and follow-up remarks.</li>
            <li><strong>Authentic Evidence:</strong> Provide legitimate photos and documentation to expedite departmental inspection and repair.</li>
            <li><strong>Fair Feedback:</strong> Submit honest star ratings and resolution remarks to help improve university services.</li>
          </ul>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
            Barani Institute of Information Technology &bull; Disciplinary and Grievance Committee
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setShowTermsModal(false)}
            >
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { RegisterPage };
