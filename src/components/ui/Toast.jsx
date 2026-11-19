import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import IconRenderer from './IconRenderer';

export default function Toast({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  message,
  onClose,
  className = '',
}) {
  if (!message) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const IconComponent = icons[type] || Info;

  return (
    <div className={`toast toast-${type} ${className}`.trim()} role="alert">
      <div className="toast-content">
        <IconRenderer icon={IconComponent} size={18} className="toast-icon" />
        <span className="toast-message">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="toast-close-button"
          onClick={onClose}
          aria-label="Dismiss toast"
        >
          <IconRenderer icon={X} size={14} />
        </button>
      )}
    </div>
  );
}
