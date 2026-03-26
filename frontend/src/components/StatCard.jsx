import { useEffect, useState, useRef } from 'react';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = typeof target === 'number' ? target : parseFloat(target) || 0;
    if (start === end) { setValue(end); return; }

    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = start + (end - start) * eased;
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

export default function StatCard({ label, value, suffix = '', prefix = '', color = '', icon, decimals = 0 }) {
  const animated = useCountUp(typeof value === 'number' ? value : parseFloat(value) || 0);
  const display = decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toLocaleString();

  return (
    <div className="stat-card animate-in">
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>
        {prefix}{display}{suffix}
      </div>
    </div>
  );
}
