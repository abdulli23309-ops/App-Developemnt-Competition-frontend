export default function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  ...props
}) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
