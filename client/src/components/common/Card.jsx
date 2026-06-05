import { useRef } from 'react';
import { useMousePosition } from '../../hooks/useAnimations';

export default function Card({ children, hover = true, glow = false, glowColor, className = '', onClick, ...props }) {
  const cardRef = useRef(null);
  const mouse = useMousePosition(hover ? cardRef : null);

  const tiltStyle = hover
    ? {
        transform: `perspective(800px) rotateX(${mouse.y * -3}deg) rotateY(${mouse.x * 3}deg)`,
        transition: mouse.x === 0 && mouse.y === 0 ? 'transform 0.4s ease' : 'transform 0.1s ease',
      }
    : {};

  const glowStyle = glow && (mouse.x !== 0 || mouse.y !== 0)
    ? {
        '--glow-x': `${(mouse.x + 1) * 50}%`,
        '--glow-y': `${(mouse.y + 1) * 50}%`,
        '--glow-color': glowColor || 'var(--accent-blue)',
      }
    : {};

  return (
    <div
      ref={cardRef}
      className={`card ${glow ? 'card--glow' : ''} ${onClick ? 'card--clickable' : ''} ${className}`}
      style={{ ...tiltStyle, ...glowStyle }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
