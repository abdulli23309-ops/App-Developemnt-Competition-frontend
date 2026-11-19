import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Shield,
  ShieldCheck,
  Lock,
  UtensilsCrossed,
  BookOpen,
  Server,
  GraduationCap,
  HelpCircle,
  EyeOff,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import FileUpload, { formatFileSize } from '../../components/ui/FileUpload';

const CATEGORY_ICONS = {
  UtensilsCrossed,
  BookOpen,
  Server,
  GraduationCap,
  HelpCircle,
};

const getCategoryIcon = (cat) => {
  if (cat?.icon && CATEGORY_ICONS[cat.icon]) return CATEGORY_ICONS[cat.icon];
  const n = (cat?.name || '').toLowerCase();
  if (n.includes('cafe') || n.includes('food')) return UtensilsCrossed;
  if (n.includes('library') || n.includes('book')) return BookOpen;
  if (n.includes('lab') || n.includes('it') || n.includes('infra')) return Server;
  if (n.includes('teach') || n.includes('acad')) return GraduationCap;
  return HelpCircle;
};

const LOCATION_PRESETS = [
  'Computer Lab 3 (CS Dept)',
  'Central Library 2nd Floor',
  'Main Cafeteria Counter',
  'Lecture Hall 4 (Block A)',
  'Student Center & Lobby',
  'Hostel Dining Hall',
];

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [error, setError] = useState(null);

  // Stepper state: 1: Category, 2: Issue & Location, 3: Details & Photos, 4: Review
  const [step, setStep] = useState(1);

  // Form Fields
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSpecificIssue, setSelectedSpecificIssue] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Real File Upload items: array of { file, name, size, type, preview, id }
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
          const defaultCat =
            res.data.data.find(
              (c) => c.name.includes('Laboratories') || c.name.includes('IT')
            ) || res.data.data[0];
          if (defaultCat) {
            setSelectedCategoryId(defaultCat.id);
            const firstIssue =
              defaultCat.issueTypes?.[0]?.name || defaultCat.specificIssues?.[0];
            if (firstIssue) {
              setSelectedSpecificIssue(firstIssue);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Unable to load categories from API.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleCategorySelect = (cat) => {
    setSelectedCategoryId(cat.id);
    const firstIssue = cat.issueTypes?.[0]?.name || cat.specificIssues?.[0];
    if (firstIssue) {
      setSelectedSpecificIssue(firstIssue);
    } else {
      setSelectedSpecificIssue('');
    }
  };

  // Step Validation
  const canProceedFromStep1 = !!selectedCategoryId;
  const canProceedFromStep2 = !!selectedSpecificIssue && !!location.trim();
  const canProceedFromStep3 = !!title.trim();

  const handleNext = () => {
    setError(null);
    if (step === 1 && !canProceedFromStep1) {
      setError('Please select a grievance category.');
      return;
    }
    if (step === 2 && !canProceedFromStep2) {
      setError('Please select a specific issue type and specify the campus location.');
      return;
    }
    if (step === 3 && !canProceedFromStep3) {
      setError('Please provide an issue summary title.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  // Submit Handler with real attachment upload integration
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !location.trim() || !selectedCategoryId) {
      setError('Please provide Issue Summary, Location, and select a Category.');
      setStep(3);
      return;
    }

    setSubmitting(true);
    setError(null);
    setUploadProgressText('Creating grievance ticket...');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || title.trim(),
        location: location.trim(),
        categoryId: selectedCategoryId,
        specificIssue: selectedSpecificIssue || undefined,
        priority: priority || 'Medium',
        isAnonymous: isAnonymous,
      };

      // 1. Create Complaint
      const res = await api.post('/complaints', payload);
      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || 'Failed to submit complaint.');
      }

      const newComplaint = res.data.data;
      const complaintId = newComplaint?.id;
      const trackingCode = newComplaint?.trackingCode;

      // 2. Upload Real Attachments sequentially if present
      if (attachedFiles.length > 0 && complaintId) {
        for (let i = 0; i < attachedFiles.length; i++) {
          const item = attachedFiles[i];
          setUploadProgressText(
            `Uploading attachment ${i + 1} of ${attachedFiles.length} (${item.name})...`
          );

          const formData = new FormData();
          formData.append('file', item.file);

          try {
            await api.post(`/complaints/${complaintId}/attachments`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (attErr) {
            console.error(`Failed to upload attachment ${item.name}:`, attErr);
            toast.warning(
              `Attachment "${item.name}" could not be uploaded: ${
                attErr.response?.data?.message || attErr.message
              }`,
              'Attachment Notice'
            );
          }
        }
      }

      toast.success(
        `Ticket ${trackingCode || `#CC-2026-${complaintId}`} registered successfully!`,
        'Grievance Submitted'
      );

      navigate(complaintId ? `/complaints/${complaintId}` : '/student/complaints');
    } catch (err) {
      console.error('Error submitting complaint:', err);
      const msg =
        err.response?.data?.message || err.message || 'Submission failed. Please check inputs.';
      setError(msg);
      toast.error(msg, 'Submission Error');
    } finally {
      setSubmitting(false);
      setUploadProgressText('');
    }
  };

  return (
    <div className="cc-form-wizard-page">
      {/* Header bar */}
      <div className="cc-wizard-topbar">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          className="cc-wizard-back-btn"
        >
          <ArrowLeft size={18} />
          <span>{step > 1 ? 'Back' : 'Cancel'}</span>
        </button>

        <div className="cc-wizard-step-badge">
          Step {step} of 4 &bull;{' '}
          {step === 1
            ? 'Department Category'
            : step === 2
            ? 'Specific Issue & Location'
            : step === 3
            ? 'Grievance Details & Evidence'
            : 'Review & Confirm'}
        </div>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="cc-stepper-track" role="tablist">
        {[
          { num: 1, label: 'Category' },
          { num: 2, label: 'Issue & Location' },
          { num: 3, label: 'Details & Photos' },
          { num: 4, label: 'Review' },
        ].map((s) => {
          const isDone = s.num < step;
          const isActive = s.num === step;

          return (
            <div
              key={s.num}
              className={`cc-stepper-node ${isDone ? 'done' : ''} ${
                isActive ? 'active' : ''
              }`}
              onClick={() => isDone && setStep(s.num)}
            >
              <div className="cc-stepper-circle">
                {isDone ? <Check size={14} strokeWidth={3} /> : s.num}
              </div>
              <span className="cc-stepper-label">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Global Error Notice */}
      {error && (
        <div className="cc-alert-box cc-alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="cc-wizard-card">
          <div className="cc-card-section-header">
            <div>
              <h2 className="cc-card-heading">Select Department Category</h2>
              <p className="cc-card-subheading">
                Identify the university facility or faculty overseeing your grievance.
              </p>
            </div>
            <span className="cc-sla-guarantee-pill">
              <Clock size={13} /> SLA Enforced
            </span>
          </div>

          {loadingCategories ? (
            <div className="cc-category-grid-loading">
              <Skeleton height={110} count={4} />
            </div>
          ) : (
            <div className="cc-category-cards-grid">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                const IconComp = getCategoryIcon(cat);

                return (
                  <div
                    key={cat.id}
                    className={`cc-category-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCategorySelect(cat);
                      }
                    }}
                  >
                    <div className="cc-cat-card-top">
                      <div className={`cc-cat-icon-box ${isSelected ? 'selected' : ''}`}>
                        <IconComp size={24} />
                      </div>
                      {isSelected ? (
                        <div className="cc-cat-check-badge">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="cc-cat-sla-tag">
                          {cat.slaHours ? `${cat.slaHours}h SLA` : '24-48h SLA'}
                        </span>
                      )}
                    </div>
                    <div className="cc-cat-card-info">
                      <h3 className="cc-cat-name">{cat.name}</h3>
                      <p className="cc-cat-desc">
                        {cat.description ||
                          'Centralized facility, equipment, and administrative service.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="cc-wizard-card-footer">
            <span className="cc-footer-helper-text">
              Selected department handles SLA triage and assigns resolution engineers.
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canProceedFromStep1}
              iconRight={ArrowRight}
            >
              Continue to Issue Details
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: SPECIFIC ISSUE & LOCATION */}
      {step === 2 && (
        <div className="cc-wizard-card">
          <div className="cc-card-section-header">
            <div>
              <h2 className="cc-card-heading">Issue Classification &amp; Location</h2>
              <p className="cc-card-subheading">
                Provide specifics for{' '}
                <strong>{selectedCategory?.name || 'Selected Department'}</strong>.
              </p>
            </div>
            <button
              type="button"
              className="cc-change-cat-link"
              onClick={() => setStep(1)}
            >
              Change Category
            </button>
          </div>

          {/* Specific Issue Type Chips */}
          <div className="cc-form-field">
            <label className="cc-field-label">
              Specific Issue Type <span className="req">*</span>
            </label>
            <div className="cc-issue-chips-wrap">
              {(
                selectedCategory?.issueTypes?.map((it) => it.name) ||
                selectedCategory?.specificIssues || [
                  'Hardware Malfunction',
                  'Network Outage',
                  'Hygiene & Sanitation',
                  'Course Materials',
                  'Facility Booking',
                ]
              ).map((issueName) => {
                const isChipSelected = selectedSpecificIssue === issueName;
                return (
                  <button
                    key={issueName}
                    type="button"
                    className={`cc-issue-chip ${isChipSelected ? 'active' : ''}`}
                    onClick={() => setSelectedSpecificIssue(issueName)}
                  >
                    {isChipSelected && <Check size={14} strokeWidth={3} />}
                    <span>{issueName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campus Location with Presets */}
          <div className="cc-form-field">
            <label htmlFor="comp-location" className="cc-field-label">
              Specific Campus Location <span className="req">*</span>
            </label>
            <div className="cc-input-icon-wrap">
              <MapPin size={17} className="cc-input-left-icon" />
              <input
                id="comp-location"
                type="text"
                className="cc-text-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lab 3, Workstation #14, 2nd Floor Block A"
                required
              />
            </div>
            <div className="cc-location-presets">
              <span className="cc-presets-label">Common locations:</span>
              {LOCATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="cc-preset-pill"
                  onClick={() => setLocation(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Level */}
          <div className="cc-form-field">
            <label className="cc-field-label">Target Urgency / Priority</label>
            <div className="cc-priority-options-grid">
              {[
                {
                  id: 'Urgent',
                  label: 'Urgent',
                  desc: 'Critical outage or safety hazard',
                  sla: '4-8h',
                },
                {
                  id: 'High',
                  label: 'High',
                  desc: 'Major disruption to study/work',
                  sla: '24h',
                },
                {
                  id: 'Medium',
                  label: 'Medium',
                  desc: 'Routine maintenance or request',
                  sla: '48h',
                },
                {
                  id: 'Low',
                  label: 'Low',
                  desc: 'Minor inquiry or suggestion',
                  sla: '72h',
                },
              ].map((p) => {
                const isSelected = priority === p.id;
                return (
                  <div
                    key={p.id}
                    className={`cc-priority-card cc-priority-${p.id.toLowerCase()} ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() => setPriority(p.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="cc-priority-top">
                      <span className="cc-priority-title">{p.label}</span>
                      <span className="cc-priority-sla">{p.sla}</span>
                    </div>
                    <p className="cc-priority-desc">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cc-wizard-card-footer">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canProceedFromStep2}
              iconRight={ArrowRight}
            >
              Continue to Details &amp; Photos
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS & EVIDENCE UPLOAD */}
      {step === 3 && (
        <div className="cc-wizard-card">
          <div className="cc-card-section-header">
            <div>
              <h2 className="cc-card-heading">Grievance Narrative &amp; Evidence</h2>
              <p className="cc-card-subheading">
                Describe the situation clearly and attach diagnostic photos for the engineers.
              </p>
            </div>
          </div>

          {/* Issue Summary Title */}
          <div className="cc-form-field">
            <label htmlFor="comp-title" className="cc-field-label">
              Issue Summary Title <span className="req">*</span>
            </label>
            <div className="cc-input-icon-wrap">
              <FileText size={17} className="cc-input-left-icon" />
              <input
                id="comp-title"
                type="text"
                className="cc-text-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Workstation #14 GPU failing to boot during Deep Learning lab"
                required
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div className="cc-form-field">
            <label htmlFor="comp-desc" className="cc-field-label">
              Detailed Description &amp; Context
            </label>
            <textarea
              id="comp-desc"
              rows={4}
              className="cc-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide relevant context, error codes, steps to reproduce, or academic impacts..."
            />
          </div>

          {/* Evidence Image Upload Component */}
          <div className="cc-form-field">
            <label className="cc-field-label">
              Photographic Evidence &amp; Attachments
              <span className="cc-label-subtext"> (Optional &bull; Max 3 images &bull; 2 MB each)</span>
            </label>
            <FileUpload
              files={attachedFiles}
              onChange={setAttachedFiles}
              maxFiles={3}
              maxSizeBytes={2 * 1024 * 1024}
            />
          </div>

          {/* Anonymous Toggle Banner */}
          <div className="cc-anonymous-card">
            <div className="cc-anon-left">
              <div className="cc-anon-icon-box">
                <EyeOff size={22} />
              </div>
              <div>
                <h4 className="cc-anon-title">Whistleblower-Grade Anonymous Filing</h4>
                <p className="cc-anon-desc">
                  When enabled, departmental administrators and technicians will see your
                  identity as "Anonymous Student". Only the University SuperAdmin retains
                  audit access.
                </p>
              </div>
            </div>
            <label className="cc-switch-label">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span className="cc-switch-slider" />
            </label>
          </div>

          <div className="cc-wizard-card-footer">
            <Button variant="outline" size="md" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canProceedFromStep3}
              iconRight={ArrowRight}
            >
              Review Grievance Docket
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div className="cc-wizard-card">
          <div className="cc-card-section-header">
            <div>
              <h2 className="cc-card-heading">Review &amp; Submit Docket</h2>
              <p className="cc-card-subheading">
                Verify all details before logging into the university SLA tracking ledger.
              </p>
            </div>
          </div>

          {/* Review Grid */}
          <div className="cc-review-docket-box">
            <div className="cc-review-row">
              <span className="cc-review-key">Target Department</span>
              <span className="cc-review-val">
                <strong>{selectedCategory?.name}</strong>
              </span>
            </div>

            <div className="cc-review-row">
              <span className="cc-review-key">Specific Issue</span>
              <span className="cc-review-val">{selectedSpecificIssue || 'General Issue'}</span>
            </div>

            <div className="cc-review-row">
              <span className="cc-review-key">Location</span>
              <span className="cc-review-val">{location}</span>
            </div>

            <div className="cc-review-row">
              <span className="cc-review-key">Assigned Priority</span>
              <span className="cc-review-val">
                <Badge variant={priority.toLowerCase()}>{priority}</Badge>
              </span>
            </div>

            <div className="cc-review-row">
              <span className="cc-review-key">Anonymity Protocol</span>
              <span className="cc-review-val">
                {isAnonymous ? (
                  <span className="cc-anon-active-tag">
                    <ShieldCheck size={14} /> Anonymous Whistleblower Protected
                  </span>
                ) : (
                  <span>Standard ({user?.fullName || 'Student'})</span>
                )}
              </span>
            </div>

            <div className="cc-review-divider" />

            <div className="cc-review-row-block">
              <span className="cc-review-key">Summary Title</span>
              <p className="cc-review-title-display">{title}</p>
            </div>

            {description && (
              <div className="cc-review-row-block">
                <span className="cc-review-key">Narrative Description</span>
                <p className="cc-review-desc-display">{description}</p>
              </div>
            )}

            <div className="cc-review-row-block">
              <span className="cc-review-key">Evidence Attachments ({attachedFiles.length})</span>
              {attachedFiles.length > 0 ? (
                <div className="cc-review-attachments-grid">
                  {attachedFiles.map((item, idx) => (
                    <div key={idx} className="cc-review-thumb-item">
                      <img src={item.preview} alt={item.name} />
                      <div className="cc-review-thumb-meta">
                        <span>{item.name}</span>
                        <small>{formatFileSize(item.size)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="cc-no-files-text">No evidence photos attached</span>
              )}
            </div>
          </div>

          {uploadProgressText && (
            <div className="cc-upload-progress-banner">
              <Sparkles size={16} className="spin" />
              <span>{uploadProgressText}</span>
            </div>
          )}

          <div className="cc-wizard-card-footer">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(3)}
              disabled={submitting}
            >
              Edit Details
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              isLoading={submitting}
              iconRight={CheckCircle2}
            >
              {submitting ? 'Submitting Grievance...' : 'Confirm & Submit Grievance'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
