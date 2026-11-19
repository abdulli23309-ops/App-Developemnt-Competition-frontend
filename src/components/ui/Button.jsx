import { Loader2 } from 'lucide-react';
import IconRenderer from './IconRenderer';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  type = 'button',
  ...props
}) {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'btn-danger',
  };

  const btnClass = `btn ${variantClasses[variant] || 'btn-primary'} ${sizeClasses[size] || ''} ${className}`.trim();

  return (
    <button
      type={type}
      className={btnClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <IconRenderer icon={Loader2} size={16} className="spin" />
      ) : icon ? (
        <IconRenderer icon={icon} size={16} />
      ) : null}
      {children}
    </button>
  );
}
