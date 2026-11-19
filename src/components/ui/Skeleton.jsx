export default function Skeleton({
  variant = 'text', // 'text' | 'rectangular' | 'circular'
  width,
  height,
  className = '',
  count = 1,
  style = {},
}) {
  const getStyle = () => {
    const s = { ...style };
    if (width) s.width = typeof width === 'number' ? `${width}px` : width;
    if (height) s.height = typeof height === 'number' ? `${height}px` : height;
    return s;
  };

  const skeletonClass = `skeleton skeleton-${variant} ${className}`.trim();

  if (count > 1) {
    return (
      <div className="skeleton-group">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClass} style={getStyle()} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClass} style={getStyle()} />;
}
