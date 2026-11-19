import React from 'react';
import IconRenderer from './IconRenderer';

export default function Badge({
  children,
  variant = 'default',
  showDot = false,
  icon,
  className = '',
  ...props
}) {
  const normalized = (variant || '').toLowerCase().replace(/[\s-_]/g, '');

  let variantClass = 'cc-badge-medium';
  if (normalized === 'urgent') variantClass = 'cc-badge-urgent';
  else if (normalized === 'high') variantClass = 'cc-badge-high';
  else if (normalized === 'medium') variantClass = 'cc-badge-medium';
  else if (normalized === 'low') variantClass = 'cc-badge-low';
  else if (normalized === 'pending' || normalized === 'awaiting') variantClass = 'cc-badge-pending';
  else if (normalized === 'inprogress' || normalized === 'active') variantClass = 'cc-badge-inprogress';
  else if (normalized === 'resolved' || normalized === 'closed') variantClass = 'cc-badge-resolved';
  else if (normalized === 'rejected') variantClass = 'cc-badge-rejected';
  else if (normalized === 'category') variantClass = 'cc-badge-category';
  else if (normalized === 'student') variantClass = 'cc-badge-student';

  return (
    <span className={`cc-badge ${variantClass} ${className}`.trim()} {...props}>
      {showDot && <span className="cc-badge-dot" />}
      {icon && <IconRenderer icon={icon} size={12} />}
      {children}
    </span>
  );
}
