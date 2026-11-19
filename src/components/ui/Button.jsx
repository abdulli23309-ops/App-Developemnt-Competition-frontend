import React from 'react';
import { Loader2 } from 'lucide-react';
import IconRenderer from './IconRenderer';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'subtle' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
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
    ghost: 'btn-ghost',
    subtle: 'btn-subtle',
    success: 'btn-success',
  };

  const btnClass = [
    'btn',
    variantClasses[variant] || 'btn-primary',
    sizeClasses[size] || '',
    fullWidth ? 'btn-full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={btnClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <IconRenderer icon={Loader2} size={16} className="btn-spinner" />
      ) : icon ? (
        <IconRenderer icon={icon} size={16} className="btn-icon-left" />
      ) : null}
      {children && <span className="btn-label">{children}</span>}
      {!isLoading && iconRight ? (
        <IconRenderer icon={iconRight} size={16} className="btn-icon-right" />
      ) : null}
    </button>
  );
}
