'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  percentage:  number;
  grade:       string;
  totalScore:  number;
  maxScore:    number;
  size?:       number;
  strokeWidth?: number;
}

function gradeColor(grade: string): string {
  if (grade === 'A') return '#22D3A0';
  if (grade === 'B') return '#3D7EFF';
  if (grade === 'C') return '#F59E0B';
  if (grade === 'D') return '#FB7185';
  return '#FF5757';
}

export default function ScoreRing({
  percentage,
  grade,
  totalScore,
  maxScore,
  size        = 160,
  strokeWidth = 10,
}: ScoreRingProps) {
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(percentage), 300);
    return () => clearTimeout(t);
  }, [percentage]);

  const r    = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (animPct / 100) * circ;
  const cx   = size / 2;
  const cy   = size / 2;
  const gc   = gradeColor(grade);

  const circleProps = {
    cx,
    cy,
    r,
    fill: 'none',
    strokeWidth,
    strokeLinecap: 'round' as const,
    style: {
      transform:       'rotate(-90deg)',
      transformOrigin: `${cx}px ${cy}px`,
      transition:      'stroke-dasharray 1.4s cubic-bezier(0.34,1.1,0.64,1)',
    },
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          strokeWidth={strokeWidth}
          stroke="rgba(255,255,255,0.06)" />

        {/* Glow layer (wider, lower opacity) */}
        <circle
          {...circleProps}
          stroke={gc}
          strokeWidth={strokeWidth + 5}
          opacity={0.15}
          strokeDasharray={`${fill} ${circ}`}
        />

        {/* Main fill */}
        <circle
          {...circleProps}
          stroke={gc}
          strokeDasharray={`${fill} ${circ}`}
        />
      </svg>

      {/* Centre text */}
      <div className="absolute text-center select-none">
        <p
          className="font-display font-bold text-white leading-none"
          style={{ fontSize: size * 0.19 }}
        >
          {animPct}%
        </p>
        <p className="font-mono text-xs font-medium mt-1" style={{ color: gc }}>
          Grade {grade}
        </p>
        <p className="text-white/30 mt-0.5" style={{ fontSize: 10 }}>
          {totalScore}/{maxScore} pts
        </p>
      </div>
    </div>
  );
}
