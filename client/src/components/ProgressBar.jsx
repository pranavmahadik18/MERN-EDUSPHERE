import React from 'react';

export const ProgressBar = ({ progress = 0, showLabel = true, height = 8 }) => {
  const normalizedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const isComplete = normalizedProgress === 100;

  return (
    <div className="progress-container">
      {showLabel && (
        <div className="progress-header">
          <span style={{ color: 'var(--text-secondary)' }}>
            {isComplete ? 'Completed 🎉' : 'Course Progress'}
          </span>
          <span style={{ color: isComplete ? '#34d399' : '#818cf8', fontWeight: 700 }}>
            {normalizedProgress}%
          </span>
        </div>
      )}
      <div className="progress-bar-track" style={{ height: `${height}px` }}>
        <div 
          className={`progress-bar-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};
