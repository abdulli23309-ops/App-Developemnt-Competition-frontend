import React, { isValidElement } from 'react';

/**
 * Robust icon renderer that safely handles:
 * - React Component references (e.g. icon={Monitor} or forwardRef)
 * - JSX Elements (e.g. icon={<Monitor />})
 * - Plain render functions
 * - Null / undefined / invalid values (renders null safely, preventing React Error #130)
 */
export default function IconRenderer({
  icon,
  size = 18,
  className = '',
  ...props
}) {
  if (!icon) return null;

  // If a JSX element was passed (e.g. <Monitor size={20} />)
  if (isValidElement(icon)) {
    return React.cloneElement(icon, {
      size: icon.props.size || size,
      className: `${icon.props.className || ''} ${className}`.trim(),
      ...props,
    });
  }

  // If a component reference was passed (function or forwardRef object)
  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && ('$$typeof' in icon || 'render' in icon))
  ) {
    const Component = icon;
    return <Component size={size} className={className} {...props} />;
  }

  // Fallback for safety - never attempt to render an unknown object as a component tag
  return null;
}
