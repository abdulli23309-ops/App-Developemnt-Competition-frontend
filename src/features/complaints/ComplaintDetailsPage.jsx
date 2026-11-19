import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  FileText,
  Paperclip,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  PhoneCall,
  Flame,
  ShieldAlert,
  ChevronRight,
  User,
  X,
  Maximize2,
  Building,
  RotateCcw,
  EyeOff,
  Server,
  Layers,
  Check,
  Shield,
  SlidersHorizontal
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import StarRating from '../../components/ui/StarRating';
import AccessDeniedPage from '../../pages/AccessDeniedPage';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [is403, setIs403] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Remark form
  const [remarkText, setRemarkText] = useState('');
  const [isRemarkInternal, setIsRemarkInternal] = useState(false);
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // Lightbox / Image zoom modal
  const [zoomedImage, setZoomedImage] = useState(null);

  // Admin controls
  const [selectedStatus, setSelectedStatus] = useState('');
  const [assignedTech, setAssignedTech] = useState('Engr. Farhan (Senior Systems Engr)');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  const [makePublicToStudent, setMakePublicToStudent] = useState(true);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Student reopen modal
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReasonText, setReopenReasonText] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchComplaint = useCallback(async () => {
    setLoading(true);
    setIs403(false);
    setErrorMessage('');
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data && res.data.success) {
        setComplaint(res.data.data);
        setSelectedStatus(res.data.data.status);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      if (err.response && err.response.status === 403) {
        setIs403(true);
        setErrorMessage(err.response?.data?.message || 'Access Denied: Server-side RBAC restriction.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to load complaint.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Handle posting a remark
  const handleAddRemark = async (e) => {
    if (e) e.preventDefault();
    if (!remarkText.trim()) return;

    setSubmittingRemark(true);
    try {
      const res = await api.post(`/complaints/${id}/remarks`, {
        message: remarkText.trim(),
        isInternal: isRemarkInternal,
      });
      if (res.data && res.data.success) {
        setComplaint((prev) => ({
          ...prev,
          remarks: [...(prev.remarks || []), res.data.data],
        }));
        setRemarkText('');
        showToast('Remark added to ticket activity log.');
      }
    } catch (err) {
      console.error('Failed to post remark:', err);
      alert(err.response?.data?.message || 'Failed to post remark.');
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Handle staff status update / rejection
  const handleUpdateStatus = async (targetStatus, customRemark, customRejection) => {
    const statusToApply = targetStatus || selectedStatus;

    if (statusToApply === 'Rejected') {
      const reasonToUse = customRejection || rejectionReason;
      if (!reasonToUse || !reasonToUse.trim()) {
        const promptReason = window.prompt('Rejection reason is strictly mandatory. Please enter reason:');
        if (!promptReason || !promptReason.trim()) {
          alert('Cannot reject ticket without a mandatory explanation.');
          return;
        }
        return handleUpdateStatus('Rejected', customRemark, promptReason.trim());
      }
    }

    setSubmittingStatus(true);
    try {
      const payload = {
        status: statusToApply,
        remark: (customRemark || statusRemark).trim() || undefined,
        rejectionReason: statusToApply === 'Rejected' ? (customRejection || rejectionReason).trim() : undefined,
      };

      const res = await api.patch(`/complaints/${id}/status`, payload);
      if (res.data && res.data.success) {
        setRejectionReason('');
        setStatusRemark('');
        showToast(`Ticket status updated to ${statusToApply}.`);
        fetchComplaint();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Conflict: Status transition could not be applied.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Handle student rating submission
  const handleRatingSubmit = async (ratingScore) => {
    setSubmittingRating(true);
    try {
      const res = await api.patch(`/complaints/${id}/rating`, {
        rating: ratingScore,
        comment: 'Resolution rating recorded by student',
      });
      if (res.data && res.data.success) {
        setComplaint((prev) => ({
          ...prev,
          ratingScore,
          ratingComment: 'Resolution rating recorded by student',
        }));
        showToast('Thank you! Your feedback has been recorded.');
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      alert(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle student reopen submission
  const handleReopenSubmit = async () => {
    if (!reopenReasonText.trim()) {
      alert('Please provide a reason for reopening this grievance.');
      return;
    }

    setSubmittingReopen(true);
    try {
      const res = await api.post(`/complaints/${id}/reopen`, {
        reason: reopenReasonText.trim(),
      });
      if (res.data && res.data.success) {
        setShowReopenModal(false);
        setReopenReasonText('');
        showToast('Complaint reopened. Department staff notified.');
        fetchComplaint();
      }
    } catch (err) {
      console.error('Failed to reopen complaint:', err);
      alert(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setSubmittingReopen(false);
    }
  };

  // 403 Access Denied
  if (is403) {
    return <AccessDeniedPage message={errorMessage} />;
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton height="80px" radius="16px" />
        <Skeleton height="200px" radius="16px" />
        <Skeleton height="300px" radius="16px" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="cc-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <AlertTriangle size={36} color="#EF4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', color: '#1E293B', marginBottom: '0.5rem' }}>
          Complaint Not Found
        </h2>
        <p style={{ color: '#64748B', marginBottom: '1.25rem' }}>
          {errorMessage || 'The requested ticket could not be located.'}
        </p>
        <Link to="/complaints" className="cc-cta-btn-white" style={{ background: '#4338CA', color: '#FFF' }}>
          Return to Complaints
        </Link>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved' || complaint.status === 'Closed';
  const isRejected = complaint.status === 'Rejected';
  const isAdminUser = isDeptAdmin || isSuperAdmin;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#1E1B4B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Header Alert Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#4338CA',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            <span>Complaints</span>
          </button>
          <span style={{ color: '#94A3B8' }}>/</span>
          <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem' }}>
            #{complaint.trackingCode}
          </span>
          <Badge variant="priority" value={complaint.priority} />
        </div>

        {/* SLA Status Pill */}
        <div>
          {complaint.isSlaBreached ? (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#DC2626',
                background: '#FEE2E2',
                border: '1px solid #FECDD3',
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <AlertTriangle size={13} />
              Breached by {Math.abs(Math.round(complaint.slaRemainingMinutes || 42))}m — ESCALATED TO HOD (TIER 2)
            </span>
          ) : isResolved ? (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#059669',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CheckCircle2 size={13} />
              Resolved within SLA Standard
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4338CA',
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Clock size={13} />
              Within SLA Target
            </span>
          )}
        </div>
      </div>

      {/* 2-COLUMN SPLIT LAYOUT (Desktop >= 1024px: Left 65%, Right 35%) */}
      <div className="cc-desktop-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isAdminUser ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '1.25rem' }}>
          
          {/* ================= LEFT COLUMN (Ticket Content & Timeline) ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1.8 }}>
            
            {/* Main Ticket Card */}
            <div className="cc-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#4338CA',
                    background: '#EEF2FF',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {complaint.categoryName}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Asset #{complaint.trackingCode} &bull; Reported {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 1rem 0', lineHeight: 1.25 }}>
                {complaint.title}
              </h1>

              {/* Submitter Profile Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {complaint.isAnonymous ? '?' : (complaint.submitterName?.charAt(0) || 'S')}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>
                      {complaint.isAnonymous ? 'Anonymous Student' : complaint.submitterName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {complaint.isAnonymous
                        ? 'Student identity withheld per grievance guidelines'
                        : `${complaint.submitterRegNo || 'Student'} • Regular Student Submitter`}
                    </div>
                  </div>
                </div>

                {complaint.isAnonymous ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#475569',
                      background: '#F1F5F9',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <EyeOff size={12} />
                    FERPA & Institutional Charter Protected
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ECFDF5',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <Check size={12} />
                    Verified Student Submitter
                  </span>
                )}
              </div>

              {/* 3 Spec Metadata Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    FACILITY LOCATION
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                    {complaint.location || 'Campus Facilities'}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    DOMAIN / ISSUE TYPE
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                    {complaint.specificIssue || complaint.categoryName}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ASSIGNED DEPARTMENT
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                    {complaint.departmentName || 'Administration'}
                  </div>
                </div>
              </div>

              {/* Statement & Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Student Statement &amp; Diagnostic Logs
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: '#334155',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  {complaint.description}
                </div>
              </div>

              {/* Rejection Notice if rejected */}
              {isRejected && (
                <div
                  style={{
                    background: '#FFF1F2',
                    border: '1.5px solid #FDA4AF',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9F1239', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <ShieldAlert size={16} />
                    <span>Ticket Rejected by Department Staff</span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#BE123C' }}>
                    <strong>Mandatory Reason Recorded:</strong> {complaint.rejectionReason}
                  </div>
                </div>
              )}

              {/* Attached Evidence Gallery */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                      Attached Evidence Gallery ({complaint.attachments.length} Files Verified)
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#4338CA', fontWeight: 600 }}>
                      Tamper-Proof Logged &bull; Click to zoom
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {complaint.attachments.map((att) => (
                      <div
                        key={att.id}
                        onClick={() => setZoomedImage(att)}
                        style={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            padding: '6px 8px',
                            background: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {att.fileName}
                          </span>
                          <Maximize2 size={12} color="#94A3B8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Audit Trail & Activity Timeline */}
            <div className="cc-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    Audit Trail &amp; Technician Activity
                  </h2>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Immutable administrative transaction registry
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#4338CA',
                    background: '#EEF2FF',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Sync ID: LOG-4029-TX
                </span>
              </div>

              {/* Vertical Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {complaint.timeline && complaint.timeline.map((event, idx) => {
                  const isLast = idx === complaint.timeline.length - 1;
                  return (
                    <div key={event.id || idx} style={{ display: 'flex', gap: '0.875rem', position: 'relative' }}>
                      {!isLast && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '11px',
                            top: '24px',
                            bottom: '-8px',
                            width: '2px',
                            backgroundColor: '#E2E8F0',
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#4338CA',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 size={14} />
                      </div>
                      <div style={{ paddingBottom: '1.25rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                            {event.title}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Activity & Remarks Section */}
            <div className="cc-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.625rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  Official Activity &amp; Remarks Thread
                </h2>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338CA' }}>
                  Direct Channel
                </span>
              </div>

              {/* Remarks List */}
              {complaint.remarks && complaint.remarks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                  {complaint.remarks.map((rem) => {
                    const isStaff = rem.authorRole !== 'Student';
                    return (
                      <div
                        key={rem.id}
                        style={{
                          background: isStaff ? '#EEF2FF' : '#F8FAFC',
                          border: isStaff ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '0.875rem 1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: isStaff ? '#4338CA' : '#64748B',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {rem.authorName ? rem.authorName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>
                              {rem.authorName} ({rem.authorRole})
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            {new Date(rem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                          {rem.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.825rem', color: '#94A3B8', marginBottom: '1rem', fontStyle: 'italic' }}>
                  No official remarks logged yet. You can post a message below.
                </div>
              )}

              {/* Add Remark Form */}
              <form onSubmit={handleAddRemark} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <textarea
                  rows={3}
                  placeholder={isAdminUser ? "Enter administrative remarks or student feedback..." : "Provide additional details or note urgency changes..."}
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {isAdminUser ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isRemarkInternal}
                        onChange={(e) => setIsRemarkInternal(e.target.checked)}
                      />
                      <span>Mark as internal staff-only remark</span>
                    </label>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} />
                      <span>Visible to assigned staff</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={submittingRemark || !remarkText.trim()}
                    className="cc-cta-btn-white"
                    style={{
                      background: '#4338CA',
                      color: '#FFFFFF',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: submittingRemark || !remarkText.trim() ? 'not-allowed' : 'pointer',
                      opacity: submittingRemark || !remarkText.trim() ? 0.6 : 1,
                    }}
                  >
                    <Send size={13} />
                    <span>{submittingRemark ? 'Sending...' : 'Send Remark'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Admin Controls & Actions) ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1.2 }}>
            
            {/* 1. SLA Enforcement Status Card */}
            <div className="cc-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1E1B4B' }}>
                  SLA Enforcement Status
                </div>
                {complaint.isSlaBreached ? (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#DC2626',
                      background: '#FEE2E2',
                      border: '1px solid #FECDD3',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    BREACHED
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#059669',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    ON TARGET
                  </span>
                )}
              </div>

              {/* Bar */}
              <div style={{ marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginBottom: '4px' }}>
                  <span>Elapsed vs SLA Allowance</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>
                    {complaint.isSlaBreached ? 'Exceeded' : `${Math.floor(complaint.slaRemainingMinutes / 60)}h ${Math.round(complaint.slaRemainingMinutes % 60)}m left`}
                  </span>
                </div>
                <div className="cc-sla-bar">
                  <div
                    className="cc-sla-fill"
                    style={{
                      width: isResolved ? '100%' : (complaint.isSlaBreached ? '100%' : '65%'),
                      backgroundColor: isResolved ? '#10B981' : (complaint.isSlaBreached ? '#EF4444' : '#4F46E5'),
                    }}
                  />
                </div>
              </div>

              {/* SLA Target Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Standard SLA Window</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{complaint.slaTargetHours || 48}.0 Hours</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>First Response Target</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>Met (21 mins)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Escalation Level</span>
                  <span style={{ fontWeight: 700, color: '#DC2626' }}>
                    {complaint.isSlaBreached ? 'Tier 2: Dept Head Office' : 'Tier 1: Standard'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Administrative Controls Card (For Admins) */}
            {isAdminUser && (
              <div className="cc-card" style={{ padding: '1.25rem', border: '1.5px solid #C7D2FE' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SlidersHorizontal size={15} color="#4338CA" />
                  <span>Administrative Controls</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {/* Status Dropdown */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                      TICKET STATUS
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.825rem',
                        background: '#FFFFFF',
                      }}
                    >
                      <option value="Pending">Pending (Triaged)</option>
                      <option value="InProgress">InProgress (In Diagnosis)</option>
                      <option value="Resolved">Resolved (Completed)</option>
                      <option value="Rejected">Rejected (Void)</option>
                    </select>
                  </div>

                  {/* Technician Select */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                      ASSIGNED TECHNICIAN
                    </label>
                    <select
                      value={assignedTech}
                      onChange={(e) => setAssignedTech(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.825rem',
                        background: '#FFFFFF',
                      }}
                    >
                      <option value="Engr. Farhan (Senior Systems Engr)">Engr. Farhan (Senior Systems Engr)</option>
                      <option value="Tariq Mehmood (Senior Network Specialist)">Tariq Mehmood (Senior Network Specialist)</option>
                      <option value="Zainab Tariq (Lab Instruments & Support)">Zainab Tariq (Lab Instruments &amp; Support)</option>
                    </select>
                  </div>

                  {/* Remarks / Action Log */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                      INTERNAL REMARKS / ACTION LOG
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter administrative notes, bench test outcomes, or instructions..."
                      value={statusRemark}
                      onChange={(e) => setStatusRemark(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.825rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Public checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={makePublicToStudent}
                      onChange={(e) => setMakePublicToStudent(e.target.checked)}
                    />
                    <span>Make resolution remarks visible to student portal</span>
                  </label>

                  {/* Primary Action Button */}
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedStatus)}
                    disabled={submittingStatus}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--color-primary-gradient)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      border: 'none',
                      cursor: submittingStatus ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)',
                    }}
                  >
                    {submittingStatus ? 'Updating Status...' : 'Update Status & Save Changes'}
                  </button>

                  {/* Immediate Operations */}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      IMMEDIATE OPERATIONS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('Resolved', 'Fast-tracked resolution applied by staff.')}
                        style={{
                          padding: '7px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          borderRadius: '8px',
                          color: '#065F46',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Resolved</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const reason = window.prompt('Enter mandatory rejection reason:');
                          if (reason && reason.trim()) {
                            handleUpdateStatus('Rejected', undefined, reason.trim());
                          } else if (reason !== null) {
                            alert('Mandatory rejection reason required.');
                          }
                        }}
                        style={{
                          padding: '7px',
                          background: '#FFF1F2',
                          border: '1px solid #FECDD3',
                          borderRadius: '8px',
                          color: '#9F1239',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <X size={13} />
                        <span>Reject / Void</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. IT Dispatch Helpline Card */}
            <div
              className="cc-card"
              style={{
                padding: '1rem',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>
                  {complaint.departmentName || 'Department'} Dispatch Helpline
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  Ext. 2404 &bull; Direct Radio 9
                </div>
              </div>
              <a
                href="tel:2404"
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: '#EEF2FF',
                  color: '#4338CA',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                }}
              >
                Call
              </a>
            </div>

            {/* 4. Student Feedback & Reopen Card (for Students) */}
            {isStudent && isResolved && (
              <div className="cc-card" style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>Resolution Satisfaction</span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#15803D', margin: '0 0 0.75rem 0' }}>
                  Rate your satisfaction with this resolved grievance:
                </p>
                <div style={{ marginBottom: '0.75rem' }}>
                  <StarRating
                    initialRating={complaint.ratingScore || 0}
                    onRatingChange={handleRatingSubmit}
                    size={24}
                  />
                  {complaint.ratingScore > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '0.25rem', fontWeight: 600 }}>
                      Rating recorded: {complaint.ratingScore} / 5 stars
                    </div>
                  )}
                </div>

                {/* Reopen Action */}
                {(complaint.reopenCount || 0) < 1 ? (
                  <div style={{ borderTop: '1px solid #DCFCE7', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowReopenModal(true)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #FCA5A5',
                        color: '#DC2626',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Reopen Grievance (1 allowed)</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid #DCFCE7', paddingTop: '0.5rem', fontSize: '0.72rem', color: '#64748B' }}>
                    Reopen quota exhausted (1/1 per policy).
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal for Attachments */}
      {zoomedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setZoomedImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '700px',
              width: '100%',
              background: '#0F172A',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#1E293B', color: '#FFF' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{zoomedImage.fileName}</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={zoomedImage.fileUrl}
              alt={zoomedImage.fileName}
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* Student Reopen Modal */}
      {showReopenModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowReopenModal(false)}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                Reopen Grievance
              </h3>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
              Institutional policy allows a student to reopen a resolved ticket exactly <strong>once</strong> if the resolution was unsatisfactory or incomplete.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: '0.35rem' }}>
                  Reason for Reopening *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why the resolution did not resolve the problem..."
                  value={reopenReasonText}
                  onChange={(e) => setReopenReasonText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: '1px solid #FECDD3',
                    backgroundColor: '#FFF1F2',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReopenSubmit}
                  disabled={submittingReopen || !reopenReasonText.trim()}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: submittingReopen || !reopenReasonText.trim() ? 'not-allowed' : 'pointer',
                    opacity: submittingReopen || !reopenReasonText.trim() ? 0.6 : 1,
                  }}
                >
                  {submittingReopen ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
