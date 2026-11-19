import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import IconRenderer from './IconRenderer';

export default function Toast({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  title,
  message,
  onClose,
  className = '',
}) {
  if (!message && !title) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const IconComponent = icons[type] || Info;

  return (
    <div
      className={`cc-toast cc-toast-${type} ${className}`.trim()}
      role="status"
    >
      <div className="cc-toast-icon-wrapper">
        <IconRenderer icon={IconComponent} size={18} className="cc-toast-icon" />
      </div>
      <div className="cc-toast-body">
        {title && <span className="cc-toast-title">{title}</span>}
        <span className="cc-toast-message">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="cc-toast-close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <IconRenderer icon={X} size={14} />
        </button>
      )}
    </div>
  );
}
