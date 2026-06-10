import React, { useRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: string;
  size?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  [key: string]: any;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    if (loading || disabled) return;

    // Ripple effect
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'btn__ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {icon && !loading && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
    </button>
  );
}
