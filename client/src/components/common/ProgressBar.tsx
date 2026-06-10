import { useEffect, useState } from 'react';

export default function ProgressBar({ value = 0, max = 100, color, size = 'md', animated = true, className = '' }) {
  const [width, setWidth] = useState(0);
  const percent = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(percent), 100);
      return () => clearTimeout(timer);
    }
    setWidth(percent);
  }, [percent, animated]);

  return (
    <div className={`progress-bar progress-bar--${size} ${className}`}>
      <div
        className="progress-bar__fill"
        style={{
          width: `${width}%`,
          backgroundColor: color || 'var(--accent-blue)',
        }}
      />
    </div>
  );
}
