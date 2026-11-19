import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Shield,
  Lock,
  UtensilsCrossed,
  BookOpen,
  Server,
  GraduationCap,
  HelpCircle,
  EyeOff,
  Upload,
  AlertCircle,
  ChevronRight,
  Info,
  MapPin,
  FileText,
  Sparkles,
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import Skeleton from '../../components/ui/Skeleton';

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

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Stepper state: 1: Category, 2: Issue Type, 3: Details & Photos, 4: Review
  const [step, setStep] = useState(1);

  // Form Fields
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedIssueChip, setSelectedIssueChip] = useState('');
  const [selectedSpecificIssue, setSelectedSpecificIssue] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Urgent');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState('');

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
          // Auto-select IT & Labs or first category by default
          const defaultCat = res.data.data.find((c) => c.name.includes('Laboratories') || c.name.includes('IT')) || res.data.data[0];
          if (defaultCat) {
            setSelectedCategoryId(defaultCat.id);
            const firstIssue = defaultCat.issueTypes?.[0]?.name || defaultCat.specificIssues?.[0];
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

  // When category changes, reset or pick appropriate default issue
  const handleCategorySelect = (cat) => {
    setSelectedCategoryId(cat.id);
    const firstIssue = cat.issueTypes?.[0]?.name || cat.specificIssues?.[0];
    if (firstIssue) {
      setSelectedSpecificIssue(firstIssue);
    } else {
      setSelectedSpecificIssue('');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !location.trim() || !selectedCategoryId) {
      setError('Please provide Issue Summary, Location, and select a Category.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || title.trim(),
        location: location.trim(),
        categoryId: selectedCategoryId,
        specificIssue: selectedSpecificIssue || selectedIssueChip || undefined,
        priority: priority || 'Medium',
        isAnonymous: isAnonymous,
        attachmentUrls: attachmentPreview ? [attachmentPreview] : [],
      };

      const res = await api.post('/complaints', payload);
      if (res.data && res.data.success) {
        const newId = res.data.data?.id;
        navigate(newId ? `/complaints/${newId}` : '/complaints');
      } else {
        setError(res.data?.message || 'Failed to submit complaint.');
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.response?.data?.message || 'Submission failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick preset sample attachment helper
  const handleAddSampleImage = () => {
    const sample = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80';
    setAttachmentPreview(sample);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#1E293B',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
          <span>{step > 1 ? 'Back' : 'New Complaint'}</span>
        </button>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
          Step {step} of 4
        </span>
      </div>

      {/* 4-Step Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
        {[
          { num: 1, label: 'Category' },
          { num: 2, label: 'Issue Type' },
          { num: 3, label: 'Details' },
          { num: 4, label: 'Review' },
        ].map((s, index) => {
          const isDone = s.num < step;
          const isActive = s.num === step;

          return (
            <React.Fragment key={s.num}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: isDone ? 'pointer' : 'default',
                }}
                onClick={() => isDone && setStep(s.num)}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isDone ? '#4338CA' : isActive ? '#4F46E5' : '#E2E8F0',
                    color: isDone || isActive ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: isActive ? '0 0 0 4px #EEF2FF' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isDone ? <Check size={16} strokeWidth={3} /> : s.num}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#4338CA' : '#64748B',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {index < 3 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: s.num < step ? '#4338CA' : '#E2E8F0',
                    margin: '0 8px 18px',
                    transition: 'background-color 0.2s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Section Title Banner */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EEF2FF', color: '#4338CA', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
          NEW TICKET FLOW
        </div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 0.25rem 0' }}>
          Submit Campus Complaint
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
          Select an area of concern. The responsible department is assigned automatically for swift resolution.
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CHOOSE COMPLAINT CATEGORY */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
              1. Choose Complaint Category
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Step 1 of 4</span>
          </div>

          {loadingCategories ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem' }}>
              <Skeleton height="140px" radius="16px" />
              <Skeleton height="140px" radius="16px" />
              <Skeleton height="140px" radius="16px" />
              <Skeleton height="140px" radius="16px" />
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.875rem',
              }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                const IconComponent = getCategoryIcon(cat);

                return (
                  <div
                    key={cat.id}
                    className={`cc-category-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: isSelected ? '#4338CA' : '#F1F5F9',
                            color: isSelected ? '#FFFFFF' : '#4338CA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{cat.name}</span>
                            {isSelected && (
                              <span style={{ fontSize: '0.65rem', background: '#4338CA', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px' }}>
                                Active
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {cat.description}
                          </div>
                        </div>
                      </div>

                      {/* Radio Circle */}
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '6px solid #4338CA' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    {/* Sample Issue Chips */}
                    {((cat.issueTypes && cat.issueTypes.length > 0) || (cat.issueChips && cat.issueChips.length > 0)) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.625rem' }}>
                        {(cat.issueTypes ? cat.issueTypes.map((i) => i.name) : cat.issueChips).slice(0, 4).map((chip, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: isSelected ? '#E0E7FF' : '#F1F5F9',
                              color: isSelected ? '#3730A3' : '#64748B',
                              fontWeight: 500,
                            }}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Live Automatically Assigned Department Card */}
          {selectedCategory && (
            <div
              style={{
                background: '#EEF2FF',
                border: '1.5px solid #C7D2FE',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#4338CA',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338CA', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Automatically Assigned Department</span>
                  <Lock size={11} />
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B' }}>
                  {selectedCategory.departmentName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6366F1' }}>
                  Department auto-routed based on selected category &amp; ticket telemetry
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="cc-cta-btn-white"
            style={{
              background: 'var(--color-primary-gradient)',
              color: '#FFFFFF',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}
            onClick={() => setStep(2)}
          >
            <span>Continue to Step 2 (Issue Type)</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 2: SELECT SPECIFIC ISSUE & SUMMARY */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
              2. Select Specific Issue
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>* Required</span>
          </div>

          {/* Specific Issue Chips */}
          {((selectedCategory?.issueTypes && selectedCategory.issueTypes.length > 0) || (selectedCategory?.specificIssues && selectedCategory.specificIssues.length > 0)) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(selectedCategory.issueTypes ? selectedCategory.issueTypes.map((i) => i.name) : selectedCategory.specificIssues).map((issue, idx) => {
                const isActive = selectedSpecificIssue === issue;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedSpecificIssue(issue);
                      if (!title) setTitle(issue);
                    }}
                    className={`cc-chip ${isActive ? 'active' : ''}`}
                    style={{ padding: '0.45rem 0.875rem' }}
                  >
                    {isActive && <Check size={14} />}
                    <span>{issue}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Issue Summary Input */}
          <div className="cc-card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
              Issue Summary / Short Title *
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '0.625rem 0.75rem',
              }}
            >
              <FileText size={18} color="#64748B" />
              <input
                type="text"
                placeholder="e.g. Lab 3 PC-14 GPU error"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  flex: 1,
                  fontSize: '0.9rem',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Submit Anonymously Toggle */}
          <div
            className="cc-card"
            style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => setIsAnonymous(!isAnonymous)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: isAnonymous ? '#4338CA' : '#F1F5F9',
                  color: isAnonymous ? '#FFFFFF' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EyeOff size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                  Submit Anonymously
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Hides your name and student email from department staff
                </div>
              </div>
            </div>

            {/* Switch Toggle UI */}
            <div
              style={{
                width: '42px',
                height: '24px',
                borderRadius: '9999px',
                backgroundColor: isAnonymous ? '#4338CA' : '#CBD5E1',
                position: 'relative',
                transition: 'background-color 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '3px',
                  left: isAnonymous ? '21px' : '3px',
                  transition: 'left 0.2s ease',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className="cc-cta-btn-white"
            style={{
              background: 'var(--color-primary-gradient)',
              color: '#FFFFFF',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
            onClick={() => {
              if (!title.trim() && selectedSpecificIssue) {
                setTitle(selectedSpecificIssue);
              }
              setStep(3);
            }}
          >
            <span>Continue to Step 3 (Details &amp; Photos)</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 3: DETAILS & PHOTOS */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            3. Incident Details &amp; Supporting Evidence
          </h2>

          {/* Incident Location */}
          <div className="cc-card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
              Incident Location *
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '0.625rem 0.75rem',
              }}
            >
              <MapPin size={18} color="#4338CA" />
              <input
                type="text"
                placeholder="e.g. Academic Block B, 2nd Floor, Lab 3, Workstation #14"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  flex: 1,
                  fontSize: '0.875rem',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Full Description */}
          <div className="cc-card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
              Full Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe what occurred, any error codes shown, or impacts on classes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#0F172A',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Priority Selection */}
          <div className="cc-card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
              Priority Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {['Low', 'Medium', 'High', 'Urgent'].map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: isSelected ? '2px solid #4338CA' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                      color: isSelected ? '#4338CA' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Supporting Photo Upload / Preview */}
          <div className="cc-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                Supporting Photo / Screenshot
              </label>
              <button
                type="button"
                onClick={handleAddSampleImage}
                style={{ fontSize: '0.75rem', color: '#4338CA', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                + Attach Demo Photo
              </button>
            </div>

            {attachmentPreview ? (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', maxHeight: '160px' }}>
                <img
                  src={attachmentPreview}
                  alt="Attachment Preview"
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setAttachmentPreview('')}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  &times;
                </button>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#F8FAFC',
                }}
                onClick={handleAddSampleImage}
              >
                <Upload size={24} color="#94A3B8" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Click to attach diagnostic screenshot or photo
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="cc-cta-btn-white"
            style={{
              background: 'var(--color-primary-gradient)',
              color: '#FFFFFF',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
            onClick={() => {
              if (!location.trim()) {
                setError('Please provide incident location.');
                return;
              }
              setStep(4);
            }}
          >
            <span>Review &amp; Confirm Submission</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            4. Review Complaint Summary
          </h2>

          <div className="cc-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Category:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{selectedCategory?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Assigned Dept:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4338CA' }}>{selectedCategory?.departmentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Issue Summary:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Location:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Priority / SLA:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: priority === 'Urgent' ? '#DC2626' : '#D97706' }}>
                  {priority} ({priority === 'Urgent' ? '4h SLA' : '24h-48h SLA'})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Privacy:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isAnonymous ? '#059669' : '#64748B' }}>
                  {isAnonymous ? 'Anonymous Submission' : `Filed as ${user?.name} (${user?.regNo})`}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="cc-cta-btn-white"
            disabled={submitting}
            style={{
              background: 'var(--color-primary-gradient)',
              color: '#FFFFFF',
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
            onClick={handleSubmit}
          >
            {submitting ? 'Transmitting to Campus System...' : 'Submit Complaint Now'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/complaints')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            Save as Draft &bull; Return Later
          </button>
        </div>
      )}

      {/* Footer Emergency Callout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#64748B',
          padding: '0.5rem 0',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Info size={14} />
        <span>Urgent campus safety hazards? Call Campus Security at ext. 4444</span>
      </div>
    </div>
  );
}
