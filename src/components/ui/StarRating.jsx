import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  initialRating = 0,
  onRatingChange,
  readOnly = false,
  size = 18,
  showLabel = true,
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating || 0);

  const handleClick = (starValue) => {
    if (readOnly) return;
    setCurrentRating(starValue);
    if (onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const activeValue = hoverRating || currentRating;

  return (
    <div className="cc-star-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: readOnly ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            color: star <= activeValue ? '#F59E0B' : '#E2E8F0',
            transition: 'color 0.15s ease, transform 0.15s ease',
          }}
          title={readOnly ? `${currentRating} of 5 stars` : `Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            fill={star <= activeValue ? '#F59E0B' : 'none'}
            stroke={star <= activeValue ? '#F59E0B' : '#94A3B8'}
          />
        </button>
      ))}
      {showLabel && currentRating > 0 && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706', marginLeft: '4px' }}>
          {currentRating}.0 / 5.0
        </span>
      )}
    </div>
  );
}
