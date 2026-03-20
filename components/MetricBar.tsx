'use client';

import { useEffect, useState } from 'react';

interface MetricBarProps {
  label:     string;
  icon:      string;
  value:     number;       // 0–10
  color:     string;       // hex primary
  glowColor: string;       // hex glow end
  delay?:    number;       // ms before animating
}

export default function MetricBar({
  label,
  icon,
  value,
  color,
  glowColor,
  delay = 0,
}: MetricBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth((value / 10) * 100), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="group mb-3 last:mb-0">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color, opacity: 0.8 }}>{icon}</span>
          <span className="text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors duration-150">
            {label}
          </span>
        </div>
        <span className="font-mono text-xs font-medium" style={{ color }}>
          {value}
          <span className="text-white/25">/10</span>
        </span>
      </div>

      {/* Bar track */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full metric-fill"
          style={{
            width:      `${width}%`,
            background: `linear-gradient(90deg, ${color}cc, ${glowColor})`,
            boxShadow:  `0 0 8px ${color}70`,
          }}
        />
      </div>
    </div>
  );
}
