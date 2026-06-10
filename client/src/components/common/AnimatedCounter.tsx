import { useCountUp } from '../../hooks/useAnimations';

export default function AnimatedCounter({ value, duration = 2000, prefix = '', suffix = '' }) {
  const displayValue = useCountUp(value, { duration, enabled: true });

  return (
    <span className="animated-counter">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}
