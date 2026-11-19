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
  ShieldAlert,
  ChevronRight,
  User,
  X,
  Maximize2,
  Download,
  Building,
  RotateCcw,
  EyeOff,
  Server,
  Layers,
  Check,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  MessageSquare,
  Sparkles,
  HelpCircle,
  UploadCloud,
  Eye,
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import StarRating from '../../components/ui/StarRating';
import Modal from '../../components/ui/Modal';
import FileUpload, { formatFileSize } from '../../components/ui/FileUpload';
import AccessDeniedPage from '../../pages/AccessDeniedPage';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const toast = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [is403, setIs403] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Remark form
  const [remarkText, setRemarkText] = useState('');
  const [isRemarkInternal, setIsRemarkInternal] = useState(false);
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // Lightbox modal
  const [zoomedImage, setZoomedImage] = useState(null);

  // Admin controls
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Student reopen modal
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReasonText, setReopenReasonText] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Upload additional attachments modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newAttachments, setNewAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

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
        setErrorMessage(
          err.response?.data?.message || 'Access Denied: Server-side RBAC restriction.'
        );
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
        toast.success('Remark added to ticket activity log.');
      }
    } catch (err) {
      console.error('Failed to post remark:', err);
      toast.error(err.response?.data?.message || 'Failed to post remark.');
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Handle staff status update
  const handleUpdateStatus = async (targetStatus, customRemark, customRejection) => {
    const statusToApply = targetStatus || selectedStatus;

    if (statusToApply === 'Rejected') {
      const reasonToUse = customRejection || rejectionReasonText;
      if (!reasonToUse || !reasonToUse.trim()) {
        setShowRejectModal(true);
        return;
      }
    }

    setSubmittingStatus(true);
    try {
      const payload = {
        status: statusToApply,
        remark: (customRemark || statusRemark).trim() || undefined,
        rejectionReason:
          statusToApply === 'Rejected'
            ? (customRejection || rejectionReasonText).trim()
            : undefined,
      };

      const res = await api.patch(`/complaints/${id}/status`, payload);
      if (res.data && res.data.success) {
        setStatusRemark('');
        setRejectionReasonText('');
        setShowRejectModal(false);
        toast.success(`Ticket status updated to ${statusToApply}.`);
        fetchComplaint();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(
        err.response?.data?.message || 'Conflict: Status transition could not be applied.'
      );
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Handle mandatory rejection submit
  const handleConfirmRejection = async () => {
    if (!rejectionReasonText.trim()) {
      toast.error('Rejection reason is strictly mandatory.');
      return;
    }
    setSubmittingReject(true);
    try {
      await handleUpdateStatus('Rejected', statusRemark, rejectionReasonText.trim());
      setShowRejectModal(false);
    } finally {
      setSubmittingReject(false);
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
        toast.success('Thank you! Your feedback has been recorded.');
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle student reopen submission
  const handleReopenSubmit = async () => {
    if (!reopenReasonText.trim()) {
      toast.error('Please provide an explanation for reopening this grievance.');
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
        toast.success('Complaint reopened. Department staff notified.');
        fetchComplaint();
      }
    } catch (err) {
      console.error('Failed to reopen complaint:', err);
      toast.error(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setSubmittingReopen(false);
    }
  };

  // Handle downloading attachment
  const handleDownloadAttachment = async (att) => {
    try {
      const res = await api.get(`/complaints/${id}/attachments/${att.id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: att.fileType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.fileName || `attachment_${att.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.info(`Downloaded "${att.fileName}"`);
    } catch (err) {
      console.warn('Direct binary download failed, opening fallback URL:', err);
      if (att.fileUrl) {
        window.open(att.fileUrl, '_blank');
      } else {
        toast.error('Failed to download attachment.');
      }
    }
  };

  // Handle uploading additional attachment to existing ticket
  const handleUploadAdditionalAttachments = async () => {
    if (newAttachments.length === 0) return;
    setUploadingAttachment(true);

    try {
      for (const item of newAttachments) {
        const formData = new FormData();
        formData.append('file', item.file);
        await api.post(`/complaints/${id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success(`${newAttachments.length} attachment(s) uploaded successfully.`);
      setShowUploadModal(false);
      setNewAttachments([]);
      fetchComplaint();
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      toast.error(err.response?.data?.message || 'Attachment upload failed.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  // 403 Access Denied
  if (is403) {
    return <AccessDeniedPage message={errorMessage} />;
  }

  if (loading) {
    return (
      <div className="cc-page-container">
        <Skeleton height={90} className="mb-4" />
        <div className="cc-details-grid">
          <Skeleton height={420} />
          <Skeleton height={420} />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="cc-page-container">
        <div className="cc-empty-box">
          <AlertTriangle size={42} className="text-danger" />
          <h2>Ticket Not Found</h2>
          <p>{errorMessage || 'The requested ticket could not be located.'}</p>
          <Button variant="primary" onClick={() => navigate('/complaints')}>
            Return to Tickets
          </Button>
        </div>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved' || complaint.status === 'Closed';
  const isRejected = complaint.status === 'Rejected';
  const isAdminUser = isDeptAdmin || isSuperAdmin;

  return (
    <div className="cc-details-page-wrapper">
      {/* Top Header Card */}
      <div className="cc-ticket-header-card">
        <div className="cc-ticket-header-top">
          <div className="cc-ticket-meta-row">
            <button
              type="button"
              className="cc-back-inline-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="cc-tracking-code-pill">
              {complaint.trackingCode || `CC-2026-00${complaint.id}`}
            </span>
            <Badge variant={complaint.status?.toLowerCase()}>{complaint.status}</Badge>
            <Badge variant={complaint.priority?.toLowerCase()}>{complaint.priority}</Badge>
            {complaint.isAnonymous && (
              <span className="cc-anon-badge">
                <ShieldCheck size={13} /> Whistleblower Protected
              </span>
            )}
          </div>

          <div className="cc-ticket-actions-group">
            {isStudent && isResolved && (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => setShowReopenModal(true)}
              >
                Reopen Grievance
              </Button>
            )}
            <Button
              variant="subtle"
              size="sm"
              icon={UploadCloud}
              onClick={() => setShowUploadModal(true)}
            >
              Add Attachment
            </Button>
          </div>
        </div>

        <h1 className="cc-ticket-main-title">{complaint.title}</h1>

        <div className="cc-ticket-properties-bar">
          <div className="cc-prop-item">
            <Building size={15} />
            <span>
              <strong>Dept:</strong> {complaint.departmentName || complaint.categoryName}
            </span>
          </div>

          <div className="cc-prop-item">
            <MapPin size={15} />
            <span>
              <strong>Location:</strong> {complaint.location || 'Campus Facilities'}
            </span>
          </div>

          <div className="cc-prop-item">
            <User size={15} />
            <span>
              <strong>Submitter:</strong>{' '}
              {complaint.isAnonymous && !isSuperAdmin
                ? 'Anonymous Student'
                : complaint.submitterName || 'Student Member'}
            </span>
          </div>

          <div className="cc-prop-item">
            <Clock size={15} />
            <span>
              <strong>Filed:</strong>{' '}
              {complaint.createdAt
                ? new Date(complaint.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent'}
            </span>
          </div>
        </div>

        {/* SLA Progress Bar */}
        <div className="cc-sla-banner">
          <div className="cc-sla-banner-info">
            <span className="cc-sla-banner-title">
              <Clock size={15} /> Resolution Target SLA: {complaint.slaTargetHours || 48} Hours
            </span>
            <span
              className={`cc-sla-countdown ${
                complaint.isSlaBreached ? 'breached' : 'ontrack'
              }`}
            >
              {complaint.isSlaBreached
                ? 'SLA Breached &bull; Escalated to Department Dean'
                : complaint.slaRemainingMinutes
                ? `${Math.round(complaint.slaRemainingMinutes / 60)} hours remaining`
                : 'Within guaranteed resolution timeframe'}
            </span>
          </div>
          <div className="cc-sla-bar-track">
            <div
              className={`cc-sla-bar-fill ${
                complaint.isSlaBreached ? 'breached' : 'ontrack'
              }`}
              style={{
                width: complaint.isSlaBreached
                  ? '100%'
                  : `${Math.min(
                      Math.max(
                        100 -
                          ((complaint.slaRemainingMinutes || 0) /
                            ((complaint.slaTargetHours || 48) * 60)) *
                            100,
                        15
                      ),
                      100
                    )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="cc-details-grid">
        
        {/* LEFT COLUMN: Narrative, Attachments, Ratings */}
        <div className="cc-details-left-col">
          {/* Narrative Card */}
          <div className="cc-card">
            <div className="cc-card-header">
              <h3 className="cc-card-title">Grievance Narrative &amp; Description</h3>
              <Badge variant="category">{complaint.specificIssue || complaint.categoryName}</Badge>
            </div>
            <div className="cc-card-body">
              <p className="cc-narrative-text">
                {complaint.description || complaint.title}
              </p>
            </div>
          </div>

          {/* Evidence Attachments Card */}
          <div className="cc-card">
            <div className="cc-card-header">
              <div className="cc-header-title-flex">
                <Paperclip size={18} />
                <h3 className="cc-card-title">
                  Photographic Evidence ({complaint.attachments?.length || 0})
                </h3>
              </div>
              <button
                type="button"
                className="cc-inline-upload-link"
                onClick={() => setShowUploadModal(true)}
              >
                + Upload More
              </button>
            </div>
            <div className="cc-card-body">
              {complaint.attachments && complaint.attachments.length > 0 ? (
                <div className="cc-attachments-gallery">
                  {complaint.attachments.map((att) => {
                    const previewUrl = att.fileUrl || '/assets/hero.png';
                    return (
                      <div key={att.id} className="cc-attachment-tile">
                        <div
                          className="cc-tile-image-box"
                          onClick={() => setZoomedImage(previewUrl)}
                        >
                          <img src={previewUrl} alt={att.fileName || 'Attachment'} />
                          <div className="cc-tile-hover-overlay">
                            <Maximize2 size={18} />
                          </div>
                        </div>
                        <div className="cc-tile-footer">
                          <span className="cc-tile-filename" title={att.fileName}>
                            {att.fileName}
                          </span>
                          <button
                            type="button"
                            className="cc-tile-download-btn"
                            onClick={() => handleDownloadAttachment(att)}
                            title="Download attachment"
                            aria-label={`Download ${att.fileName}`}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="cc-empty-mini">
                  <Paperclip size={24} className="text-muted" />
                  <span>No photographic evidence attached to this ticket.</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Rating Card (If Resolved) */}
          {isResolved && (
            <div className="cc-card cc-rating-highlight-card">
              <div className="cc-card-header">
                <div className="cc-header-title-flex">
                  <Sparkles size={18} className="text-amber" />
                  <h3 className="cc-card-title">Resolution Satisfaction Rating</h3>
                </div>
                <Badge variant="resolved">Resolved</Badge>
              </div>
              <div className="cc-card-body">
                <p className="cc-rating-intro">
                  {isStudent
                    ? 'Please rate your satisfaction with the resolution turnaround provided by the department engineers:'
                    : 'Student satisfaction rating for this completed service:'}
                </p>
                <div className="cc-rating-interactive-row">
                  <StarRating
                    initialRating={complaint.ratingScore || 0}
                    onRatingChange={isStudent ? handleRatingSubmit : undefined}
                    readOnly={!isStudent}
                    size={28}
                  />
                  {complaint.ratingComment && (
                    <span className="cc-rating-comment-bubble">
                      "{complaint.ratingComment}"
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rejection / Reopen Notice (If applicable) */}
          {complaint.rejectionReason && (
            <div className="cc-alert-box cc-alert-danger">
              <AlertTriangle size={20} />
              <div>
                <strong>Rejection Justification:</strong>
                <p style={{ margin: '4px 0 0 0' }}>{complaint.rejectionReason}</p>
              </div>
            </div>
          )}

          {complaint.reopenReason && !complaint.rejectionReason && (
            <div className="cc-alert-box cc-alert-warning">
              <RotateCcw size={20} />
              <div>
                <strong>Reopen Reason:</strong>
                <p style={{ margin: '4px 0 0 0' }}>{complaint.reopenReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Triage Controls (Admin) & Timeline & Discussion */}
        <div className="cc-details-right-col">
          
          {/* Admin Triage & Status Control Card */}
          {isAdminUser && (
            <div className="cc-card cc-triage-card">
              <div className="cc-card-header cc-triage-card-header">
                <div className="cc-header-title-flex">
                  <SlidersHorizontal size={18} className="cc-triage-header-icon" />
                  <h3 className="cc-card-title">Department Triage &amp; Management</h3>
                </div>
                <span className="cc-staff-only-tag">STAFF CONTROLS</span>
              </div>
              <div className="cc-card-body cc-triage-card-body">
                <div className="cc-form-field">
                  <label htmlFor="triage-status-select" className="cc-field-label">
                    Update Ticket Status
                  </label>
                  <select
                    id="triage-status-select"
                    className="cc-select cc-triage-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="Pending">Pending (Awaiting Triage)</option>
                    <option value="In Progress">In Progress (Assigned to Tech)</option>
                    <option value="Resolved">Resolved (Completed)</option>
                    <option value="Rejected">Rejected (Out of Scope / Invalid)</option>
                  </select>
                </div>

                <div className="cc-form-field">
                  <label htmlFor="triage-remark-input" className="cc-field-label">
                    Status Update Log Remark
                  </label>
                  <textarea
                    id="triage-remark-input"
                    rows={3}
                    className="cc-triage-textarea"
                    value={statusRemark}
                    onChange={(e) => setStatusRemark(e.target.value)}
                    placeholder="e.g., Technician dispatched to replace faulty hardware or timetable updated..."
                  />
                </div>

                <div className="cc-triage-buttons-row">
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={submittingStatus}
                    onClick={() => handleUpdateStatus(selectedStatus)}
                  >
                    Apply Status Change
                  </Button>

                  {selectedStatus !== 'Rejected' && (
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => setShowRejectModal(true)}
                    >
                      Reject Ticket...
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="cc-card">
            <div className="cc-card-header">
              <div className="cc-header-title-flex">
                <Clock size={18} />
                <h3 className="cc-card-title">Status Ledger &amp; Timeline</h3>
              </div>
            </div>
            <div className="cc-card-body">
              <div className="cc-timeline-flow">
                {complaint.timeline && complaint.timeline.length > 0 ? (
                  complaint.timeline.map((event, idx) => (
                    <div key={idx} className="cc-timeline-entry">
                      <div className="cc-timeline-marker">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="cc-timeline-entry-content">
                        <div className="cc-timeline-entry-header">
                          <span className="cc-timeline-status">
                            {event.newStatus || event.status || 'Status Updated'}
                          </span>
                          <span className="cc-timeline-time">
                            {event.changedAt
                              ? new Date(event.changedAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                          </span>
                        </div>
                        <p className="cc-timeline-remarks">
                          {event.remarks || 'No remarks provided.'}
                        </p>
                        {event.changedBy && (
                          <span className="cc-timeline-actor">
                            Updated by: {event.changedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cc-timeline-entry">
                    <div className="cc-timeline-marker">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="cc-timeline-entry-content">
                      <span className="cc-timeline-status">Ticket Logged</span>
                      <p className="cc-timeline-remarks">Grievance submitted by student.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discussion & Remarks Thread */}
          <div className="cc-card">
            <div className="cc-card-header">
              <div className="cc-header-title-flex">
                <MessageSquare size={18} />
                <h3 className="cc-card-title">
                  Discussion &amp; Remarks ({complaint.remarks?.length || 0})
                </h3>
              </div>
            </div>
            <div className="cc-card-body">
              {/* Remarks List */}
              <div className="cc-remarks-thread">
                {complaint.remarks && complaint.remarks.length > 0 ? (
                  complaint.remarks.map((r, i) => (
                    <div
                      key={r.id || i}
                      className={`cc-remark-bubble ${r.isInternal ? 'internal-note' : ''}`}
                    >
                      <div className="cc-remark-meta">
                        <span className="cc-remark-author">
                          {r.authorName || (r.isInternal ? 'Department Staff' : 'Student')}
                        </span>
                        {r.isInternal && (
                          <span className="cc-internal-pill">
                            <Lock size={11} /> Internal Note
                          </span>
                        )}
                        <span className="cc-remark-timestamp">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <p className="cc-remark-content">{r.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="cc-empty-mini">
                    <MessageSquare size={22} className="text-muted" />
                    <span>No remarks or inquiries logged yet.</span>
                  </div>
                )}
              </div>

              {/* Add Remark Input */}
              <form onSubmit={handleAddRemark} className="cc-add-remark-form">
                <textarea
                  rows={2}
                  className="cc-textarea"
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="Post an inquiry or update to the ticket activity thread..."
                  required
                />

                <div className="cc-remark-form-bottom">
                  {isAdminUser ? (
                    <label className="cc-checkbox-inline">
                      <input
                        type="checkbox"
                        checked={isRemarkInternal}
                        onChange={(e) => setIsRemarkInternal(e.target.checked)}
                      />
                      <span>
                        <Lock size={12} /> Staff-Only Internal Note
                      </span>
                    </label>
                  ) : (
                    <span className="cc-helper-note">Visible to departmental technicians</span>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={submittingRemark}
                    disabled={!remarkText.trim()}
                    iconRight={Send}
                  >
                    Send Remark
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {zoomedImage && (
        <div
          className="cc-lightbox-overlay"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="cc-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Enlarged evidence" />
            <button
              type="button"
              className="cc-lightbox-close"
              onClick={() => setZoomedImage(null)}
              aria-label="Close enlarged preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Rejection Modal (Mandatory Reason) */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Grievance Ticket"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
            Under institutional oversight policies, a formal rejection reason is strictly
            mandatory. The student will be informed of this reason.
          </p>

          <div className="cc-form-field">
            <label className="cc-field-label">
              Mandatory Rejection Explanation <span className="req">*</span>
            </label>
            <textarea
              rows={4}
              className="cc-textarea"
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="Explain why this ticket cannot be resolved (e.g. Duplicate request, out-of-warranty personal gear, false report)..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectModal(false)}
              disabled={submittingReject}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={submittingReject}
              disabled={!rejectionReasonText.trim()}
              onClick={handleConfirmRejection}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reopen Ticket Modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        title="Reopen Grievance Ticket"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
            If the issue remains unresolved or reoccurred after closure, please explain why
            you are reopening this ticket.
          </p>

          <div className="cc-form-field">
            <label className="cc-field-label">
              Reason for Reopening <span className="req">*</span>
            </label>
            <textarea
              rows={4}
              className="cc-textarea"
              value={reopenReasonText}
              onChange={(e) => setReopenReasonText(e.target.value)}
              placeholder="e.g. Workstation booted once but shut down with kernel panic after 15 minutes of use..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReopenModal(false)}
              disabled={submittingReopen}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submittingReopen}
              disabled={!reopenReasonText.trim()}
              onClick={handleReopenSubmit}
            >
              Submit Reopen Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Additional Attachment Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Attach Additional Evidence"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
            Upload supplemental photos or diagnostic screenshots for this ticket.
          </p>

          <FileUpload
            files={newAttachments}
            onChange={setNewAttachments}
            maxFiles={3}
            maxSizeBytes={2 * 1024 * 1024}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(false)}
              disabled={uploadingAttachment}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={uploadingAttachment}
              disabled={newAttachments.length === 0}
              onClick={handleUploadAdditionalAttachments}
            >
              Upload to Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
