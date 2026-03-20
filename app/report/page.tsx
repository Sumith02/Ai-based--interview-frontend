'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MetricBar from '@/components/MetricBar';
import ScoreRing from '@/components/ScoreRing';
import { getQuestion } from '@/lib/api';
import type { ReportResponse, QuestionDetail, Metrics } from '@/types/index';

/* ── Config ───────────────────────────────────────────────────────────────── */
const METRIC_CONFIG = [
  { key: 'confidence',      label: 'Confidence',     icon: '◎', color: '#3D7EFF', glow: '#60EFFF' },
  { key: 'body_language',   label: 'Body Language',  icon: '◉', color: '#F59E0B', glow: '#FCD34D' },
  { key: 'knowledge',       label: 'Knowledge',      icon: '◈', color: '#A78BFA', glow: '#C4B5FD' },
  { key: 'fluency',         label: 'Fluency',        icon: '◆', color: '#22D3A0', glow: '#6EE7B7' },
  { key: 'skill_relevance', label: 'Skill Relevance',icon: '◇', color: '#FB7185', glow: '#FDA4AF' },
] as const;

type MetricKey = (typeof METRIC_CONFIG)[number]['key'];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function gradeColor(grade: string): string {
  if (grade === 'A') return '#22D3A0';
  if (grade === 'B') return '#3D7EFF';
  if (grade === 'C') return '#F59E0B';
  if (grade === 'D') return '#FB7185';
  return '#FF5757';
}

function qAvg(q: QuestionDetail): number {
  if (!q.metrics) return 0;
  return Object.values(q.metrics).reduce((a, b) => a + b, 0) / 5;
}

function qColor(avg: number): string {
  if (avg >= 8) return '#22D3A0';
  if (avg >= 6) return '#3D7EFF';
  return '#FB7185';
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
interface InfoCardProps {
  title:    string;
  accent:   string;
  icon:     string;
  items:    string[];
}

function InfoCard({ title, accent, icon, items }: InfoCardProps) {
  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <h3
        className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2"
      >
        <span style={{ color: accent }}>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2.5 flex-1">
        {items.length === 0 ? (
          <li className="text-xs text-white/25 italic">No data available.</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/55 leading-relaxed">
              <span className="flex-shrink-0 text-xs mt-0.5" style={{ color: accent }}>
                {icon === '✓' ? '✓' : icon === '▲' ? '▲' : '◈'}
              </span>
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function ReportPage() {
  const router = useRouter();

  const [report,   setReport]   = useState<ReportResponse | null>(null);
  const [selQ,     setSelQ]     = useState<QuestionDetail | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [qError,   setQError]   = useState('');

  /* load report from localStorage */
  useEffect(() => {
    const raw = localStorage.getItem('ait_report');
    if (!raw) { router.push('/'); return; }
    try {
      setReport(JSON.parse(raw));
    } catch {
      router.push('/');
    }
  }, [router]);

  /* load individual question detail */
  async function loadQuestion(n: number) {
    if (!report) return;
    setLoadingQ(true);
    setQError('');
    setSelQ(null);
    try {
      // Try local breakdown first to avoid extra network call
      const local = report.question_breakdown?.find((q) => q.number === n);
      if (local) {
        setSelQ(local);
      } else {
        const data = await getQuestion(report.session_id, n);
        setSelQ(data);
      }
    } catch {
      // Fall back to local even on network error
      const local = report.question_breakdown?.find((q) => q.number === n);
      if (local) {
        setSelQ(local);
      } else {
        setQError('Could not load question details.');
      }
    } finally {
      setLoadingQ(false);
    }
  }

  /* download report JSON */
  function downloadReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `interview_report_${report.session_id?.slice(0, 8) ?? 'report'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* reset & start over */
  function handleNewSession() {
    localStorage.removeItem('ait_session');
    localStorage.removeItem('ait_report');
    router.push('/');
  }

  /* loading state */
  if (!report) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-azure/25 border-t-azure animate-spin" />
      </div>
    );
  }

  const {
    overall,
    ats_analysis,
    strengths       = [],
    areas_to_improve = [],
    interview_tips  = [],
    question_breakdown = [],
  } = report;

  const gc = gradeColor(overall.grade);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-ink-950 relative overflow-hidden">

      {/* ── Ambient orbs ── */}
      <div className="orb w-96 h-96" style={{ background:'rgba(61,126,255,0.14)', top:'-120px', right:'-40px', animationDuration:'17s' }} />
      <div className="orb w-72 h-72" style={{ background:'rgba(167,139,250,0.09)', bottom:'-80px', left:'-20px', animationDuration:'23s', animationDelay:'-11s' }} />
      <div className="orb w-48 h-48" style={{ background:'rgba(34,211,160,0.07)', top:'40%', left:'50%', animationDuration:'19s', animationDelay:'-5s' }} />

      {/* ── Grid texture ── */}
      <div className="grid-texture" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-20 border-b border-white/[0.05] bg-ink-950/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-white/28 hover:text-white/65 transition-colors text-sm"
            >
              ←
            </button>
            <div className="w-px h-4" style={{ background:'rgba(255,255,255,0.1)' }} />
            <span className="font-display font-bold text-white text-sm">Performance Report</span>
            {report.report_id && (
              <span className="tag text-white/22 border-white/8 hidden sm:inline-block"
                style={{ background:'rgba(255,255,255,0.03)', fontSize:9 }}>
                {report.report_id.slice(0, 12)}
              </span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewSession}
              className="btn-ghost text-xs px-4 py-2 rounded-lg text-white/38 hover:text-white/70"
            >
              New session
            </button>
            <button
              onClick={downloadReport}
              className="btn-azure text-xs px-4 py-2 rounded-lg text-white font-semibold"
            >
              Download ↓
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-5">

        {/* Page header */}
        <div className="animate-fadeIn">
          <p className="font-mono text-xs text-white/22 mb-1">{report.generated_date}</p>
          <h1 className="font-display font-bold text-3xl gradient-text">Performance Report</h1>
        </div>

        {/* ══ HERO SCORE CARD ══ */}
        <div
          className="glass-card overflow-hidden relative animate-slideIn"
          style={{ animationDelay:'0s' }}
        >
          {/* Colour-tinted radial based on grade */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background:`radial-gradient(ellipse 55% 90% at 8% 50%, ${gc}08, transparent)` }}
          />

          <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Score ring */}
            <div className="flex-shrink-0">
              <ScoreRing
                percentage={overall.percentage}
                grade={overall.grade}
                totalScore={overall.total_score}
                maxScore={overall.max_score}
              />
            </div>

            {/* Metrics */}
            <div className="flex-1 w-full min-w-0">
              <h2 className="font-display font-bold text-2xl text-white mb-1">
                {overall.grade_label}
              </h2>
              <p className="text-white/38 text-sm mb-6">
                {overall.total_score} of {overall.max_score} total points
              </p>

              <div className="space-y-0.5">
                {METRIC_CONFIG.map((m, i) => (
                  <MetricBar
                    key={m.key}
                    label={m.label}
                    icon={m.icon}
                    value={overall.metrics?.[m.key as MetricKey] ?? 0}
                    color={m.color}
                    glowColor={m.glow}
                    delay={i * 110}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ ATS CARD ══ */}
        <div
          className="glass-card p-6 animate-slideIn"
          style={{ animationDelay:'0.08s', opacity:0 }}
        >
          <div className="flex flex-col sm:flex-row items-start gap-8">

            {/* Score */}
            <div className="flex-shrink-0">
              <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-2">ATS Score</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="font-display font-bold text-5xl text-white">
                  {ats_analysis?.ats_score ?? '--'}
                </span>
                <span className="text-white/28 text-xl">/100</span>
              </div>
              <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full metric-fill"
                  style={{
                    width:      `${ats_analysis?.ats_score ?? 0}%`,
                    background: 'linear-gradient(90deg,#3D7EFF,#60EFFF)',
                    boxShadow:  '0 0 8px rgba(61,126,255,0.5)',
                  }}
                />
              </div>
            </div>

            {/* Improvement suggestions */}
            {(ats_analysis?.improvements?.length ?? 0) > 0 && (
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-3">
                  Improvement Suggestions
                </p>
                <ul className="space-y-2.5">
                  {ats_analysis.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/55 leading-relaxed">
                      <span className="text-warn flex-shrink-0 mt-0.5">▲</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ══ STRENGTHS / AREAS / TIPS ══ */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideIn"
          style={{ animationDelay:'0.14s', opacity:0 }}
        >
          <InfoCard
            title="Strengths"
            accent="#22D3A0"
            icon="✓"
            items={strengths}
          />
          <InfoCard
            title="Areas to Improve"
            accent="#F59E0B"
            icon="▲"
            items={areas_to_improve}
          />
          <InfoCard
            title="Interview Tips"
            accent="#A78BFA"
            icon="◈"
            items={interview_tips}
          />
        </div>

        {/* ══ QUESTION BREAKDOWN ══ */}
        <div
          className="glass-card p-6 animate-slideIn"
          style={{ animationDelay:'0.2s', opacity:0 }}
        >
          <h3 className="font-display font-bold text-base text-white mb-5 flex items-center gap-2">
            <span className="text-azure">◈</span>
            Question Breakdown
          </h3>

          {/* Question selector grid */}
          {question_breakdown.length === 0 ? (
            <p className="text-xs text-white/25 italic mb-4">No question data available.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {question_breakdown.map((q) => {
                const avg   = qAvg(q);
                const color = qColor(avg);
                const isSel = selQ?.number === q.number;

                return (
                  <button
                    key={q.number}
                    onClick={() => loadQuestion(q.number)}
                    className="flex flex-col items-center justify-center rounded-xl border font-mono transition-all duration-200"
                    style={{
                      width:  48,
                      height: 48,
                      background:   isSel ? 'rgba(61,126,255,0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor:  isSel ? 'rgba(61,126,255,0.55)'  : 'rgba(255,255,255,0.08)',
                      boxShadow:    isSel ? '0 0 16px rgba(61,126,255,0.3)' : 'none',
                      transform:    isSel ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="font-display font-bold text-sm leading-none"
                      style={{ color: isSel ? '#60EFFF' : '#fff' }}
                    >
                      Q{q.number}
                    </span>
                    <span className="text-[9px] leading-none mt-0.5" style={{ color }}>
                      {avg.toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading spinner */}
          {loadingQ && (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 rounded-full border-2 border-azure/25 border-t-azure animate-spin" />
            </div>
          )}

          {/* Error */}
          {qError && (
            <p className="text-xs text-danger/65 text-center py-4">{qError}</p>
          )}

          {/* Question detail panel */}
          {selQ && !loadingQ && (
            <div
              className="rounded-2xl border p-5 space-y-5 animate-fadeIn"
              style={{
                background:  'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              {/* Q&A */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="font-mono text-[9px] text-white/22 uppercase tracking-widest mb-2">
                    Question {selQ.number}
                  </p>
                  <p className="text-sm font-medium text-white/78 leading-relaxed">
                    {selQ.question}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/22 uppercase tracking-widest mb-2">
                    Your Answer
                  </p>
                  <p className="text-sm text-white/38 leading-relaxed">
                    {selQ.answer || <em className="not-italic text-white/20">No answer recorded.</em>}
                  </p>
                </div>
              </div>

              <div className="divider" />

              {/* Per-question metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {METRIC_CONFIG.map((m, i) => (
                  <MetricBar
                    key={m.key}
                    label={m.label}
                    icon={m.icon}
                    value={selQ.metrics?.[m.key as MetricKey] ?? 0}
                    color={m.color}
                    glowColor={m.glow}
                    delay={i * 70}
                  />
                ))}
              </div>

              {/* Feedback */}
              {selQ.feedback && (
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    background:  'rgba(61,126,255,0.05)',
                    borderColor: 'rgba(61,126,255,0.18)',
                  }}
                >
                  <p className="font-mono text-[9px] text-azure/75 uppercase tracking-widest mb-2">
                    AI Feedback
                  </p>
                  <p className="text-sm text-white/58 leading-relaxed">{selQ.feedback}</p>
                </div>
              )}

              {/* Strengths + Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(selQ.strengths?.length ?? 0) > 0 && (
                  <div>
                    <p className="font-mono text-[9px] text-success/55 uppercase tracking-widest mb-2.5">
                      Strengths
                    </p>
                    <ul className="space-y-1.5">
                      {selQ.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/48 leading-relaxed">
                          <span className="text-success/55 flex-shrink-0 mt-0.5">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(selQ.improvements?.length ?? 0) > 0 && (
                  <div>
                    <p className="font-mono text-[9px] text-warn/55 uppercase tracking-widest mb-2.5">
                      Improvements
                    </p>
                    <ul className="space-y-1.5">
                      {selQ.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/48 leading-relaxed">
                          <span className="text-warn/55 flex-shrink-0 mt-0.5">▲</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!selQ && !loadingQ && !qError && (
            <div className="text-center py-10">
              <p className="font-mono text-xs text-white/18">
                Select a question above to see the detailed breakdown
              </p>
            </div>
          )}
        </div>

        {/* ══ FOOTER ACTIONS ══ */}
        <div className="flex justify-center gap-3 pb-10">
          <button
            onClick={handleNewSession}
            className="btn-azure px-8 py-3 rounded-xl font-semibold text-sm text-white"
          >
            Start New Session →
          </button>
          <button
            onClick={downloadReport}
            className="btn-ghost px-6 py-3 rounded-xl font-medium text-sm text-white/45 hover:text-white/70"
          >
            Download JSON
          </button>
        </div>

      </div>
    </div>
  );
}
