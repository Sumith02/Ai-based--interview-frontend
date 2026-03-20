'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MetricBar from '@/components/MetricBar';
import { submitAnswer, endInterview, MAX_QUESTIONS } from '@/lib/api';
import type { Metrics, HistoryEntry } from '@/types/index';

/* ── Config ───────────────────────────────────────────────────────────────── */
const METRIC_CONFIG = [
  { key: 'confidence',      label: 'Confidence',     icon: '◎', color: '#3D7EFF', glow: '#60EFFF' },
  { key: 'body_language',   label: 'Body Language',  icon: '◉', color: '#F59E0B', glow: '#FCD34D' },
  { key: 'knowledge',       label: 'Knowledge',      icon: '◈', color: '#A78BFA', glow: '#C4B5FD' },
  { key: 'fluency',         label: 'Fluency',        icon: '◆', color: '#22D3A0', glow: '#6EE7B7' },
  { key: 'skill_relevance', label: 'Skill Relevance',icon: '◇', color: '#FB7185', glow: '#FDA4AF' },
] as const;

type MetricKey = (typeof METRIC_CONFIG)[number]['key'];

const EMPTY_METRICS: Metrics = {
  confidence: 0, body_language: 0, knowledge: 0, fluency: 0, skill_relevance: 0,
};

/* ── Component ────────────────────────────────────────────────────────────── */
export default function InterviewPage() {
  const router  = useRouter();
  const histRef = useRef<HTMLDivElement>(null);

  const [sessionId,    setSessionId]    = useState('');
  const [question,     setQuestion]     = useState('');
  const [qNum,         setQNum]         = useState(1);
  const [atsScore,     setAtsScore]     = useState(0);
  const [skills,       setSkills]       = useState<string[]>([]);
  const [answer,       setAnswer]       = useState('');
  const [metrics,      setMetrics]      = useState<Metrics>(EMPTY_METRICS);
  const [feedback,     setFeedback]     = useState('');
  const [history,      setHistory]      = useState<HistoryEntry[]>([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [ending,       setEnding]       = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState('');

  /* load session from localStorage */
  useEffect(() => {
    const raw = localStorage.getItem('ait_session');
    if (!raw) { router.push('/'); return; }
    try {
      const s = JSON.parse(raw);
      setSessionId(s.session_id);
      setQuestion(s.question);
      setQNum(s.question_number ?? 1);
      setAtsScore(s.ats_score ?? 0);
      setSkills(s.skills_found ?? []);
      setHistory([{ type: 'question', content: s.question, questionNumber: s.question_number ?? 1 }]);
    } catch {
      router.push('/');
    }
  }, [router]);

  /* auto-scroll history */
  useEffect(() => {
    if (histRef.current) histRef.current.scrollTop = histRef.current.scrollHeight;
  }, [history]);

  /* submit answer */
  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || submitting || done) return;
    setSubmitting(true);
    setError('');
    try {
      const data = await submitAnswer(sessionId, answer.trim());

      setMetrics(data.metrics);
      setFeedback(data.feedback ?? '');
      setAnswer('');

      const base: HistoryEntry[] = [
        ...history,
        { type: 'answer',  content: answer.trim() },
        { type: 'metrics', content: data.feedback ?? '', metrics: data.metrics },
      ];

      if (data.completed) {
        setDone(true);
        setHistory([...base, { type: 'system', content: '🎉 Interview complete!' }]);
      } else {
        setHistory([
          ...base,
          { type: 'question', content: data.next_question!, questionNumber: data.question_number },
        ]);
        setQuestion(data.next_question!);
        setQNum(data.question_number ?? qNum + 1);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  }, [answer, submitting, done, sessionId, history, qNum]);

  /* end interview */
  async function handleEnd() {
    if (ending) return;
    setEnding(true);
    setError('');
    try {
      const report = await endInterview(sessionId);
      localStorage.setItem('ait_report', JSON.stringify(report));
      router.push('/report');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate report.');
      setEnding(false);
    }
  }

  /* Ctrl+Enter shortcut */
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSubmit(); }
  }

  /* derived */
  const progress   = Math.round(((qNum - 1) / MAX_QUESTIONS) * 100);
  const avgScore   = Object.values(metrics).reduce((a, b) => a + b, 0) / 5;
  const shortSid   = sessionId.slice(0, 8);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col relative overflow-hidden">

      {/* ── Ambient orbs ── */}
      <div className="orb w-80 h-80" style={{ background:'rgba(61,126,255,0.14)', top:'-60px', right:'60px', animationDuration:'16s' }} />
      <div className="orb w-56 h-56" style={{ background:'rgba(167,139,250,0.1)', bottom:0, left:'30px', animationDuration:'21s', animationDelay:'-9s' }} />

      {/* ── Grid texture ── */}
      <div className="grid-texture" />

      {/* ── Navbar ── */}
      <nav className="relative z-20 border-b border-white/[0.05] bg-ink-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand + session badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#3D7EFF,#60EFFF)' }}>
              <span className="font-display font-bold text-[10px] text-white">IP</span>
            </div>
            <span className="font-display font-bold text-white text-base tracking-tight">
              Interview<span className="azure-text">Pro</span>
            </span>
            {shortSid && (
              <span className="tag text-white/25 border-white/10 hidden sm:inline-block"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                {shortSid}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full metric-fill"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#3D7EFF,#60EFFF)' }}
              />
            </div>
            <span className="font-mono text-xs text-white/30 whitespace-nowrap">Q{qNum}/{MAX_QUESTIONS}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleEnd}
              disabled={ending || !sessionId}
              className="btn-ghost text-xs px-4 py-2 rounded-lg text-white/45 hover:text-white/80"
            >
              {ending ? 'Generating…' : 'End & report →'}
            </button>
          </div>
        </div>

        {/* Bottom progress strip */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full metric-fill"
            style={{ width:`${progress}%`, background:'linear-gradient(90deg,#3D7EFF,#60EFFF)', boxShadow:'0 0 8px rgba(61,126,255,0.5)' }} />
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-5 flex flex-col lg:flex-row gap-4">

        {/* ══ SIDEBAR ══ */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-3">

          {/* Session card */}
          <div className="glass-card p-4">
            <p className="tag text-white/25 border-white/8 mb-3 block"
              style={{ background:'rgba(255,255,255,0.03)', fontSize:9 }}>
              SESSION
            </p>
            <div className="space-y-2.5 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/38">Status</span>
                <span className={`tag ${done
                  ? 'text-success/75 border-success/22 bg-success/8'
                  : 'text-azure/80 border-azure/22 bg-azure/8'}`}>
                  {done ? '✓ Complete' : '● Active'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/38">Progress</span>
                <span className="font-mono text-xs text-white/65">{qNum - 1}/{MAX_QUESTIONS}</span>
              </div>
            </div>
            {/* Mini progress bar */}
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full metric-fill"
                style={{ width:`${progress}%`, background:'linear-gradient(90deg,#3D7EFF,#60EFFF)' }} />
            </div>
            <p className="text-right font-mono text-xs text-white/22 mt-1">{progress}%</p>
          </div>

          {/* ATS card */}
          <div className="glass-card p-4">
            <p className="tag text-white/25 border-white/8 mb-3 block"
              style={{ background:'rgba(255,255,255,0.03)', fontSize:9 }}>
              ATS SCORE
            </p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-display font-bold text-3xl text-white">{atsScore}</span>
              <span className="text-white/28 text-sm">/100</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full metric-fill"
                style={{ width:`${atsScore}%`, background:'linear-gradient(90deg,#3D7EFF,#60EFFF)', boxShadow:'0 0 8px rgba(61,126,255,0.5)' }} />
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 9).map((s) => (
                  <span key={s} className="tag text-white/35 border-white/10"
                    style={{ background:'rgba(255,255,255,0.04)' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Live metrics card */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="tag text-white/25 border-white/8"
                style={{ background:'rgba(255,255,255,0.03)', fontSize:9 }}>
                LIVE METRICS
              </p>
              {avgScore > 0 && (
                <span className="font-mono text-xs text-azure">{avgScore.toFixed(1)} avg</span>
              )}
            </div>
            {METRIC_CONFIG.map((m, i) => (
              <MetricBar
                key={m.key}
                label={m.label}
                icon={m.icon}
                value={metrics[m.key as MetricKey]}
                color={m.color}
                glowColor={m.glow}
                delay={i * 80}
              />
            ))}
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Question card */}
          <div className="glass-card p-6 animate-slideIn">
            <div className="flex items-start gap-4">
              {/* Number badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm text-white"
                style={{
                  background: 'linear-gradient(135deg,#3D7EFF,#1A5EFF)',
                  boxShadow:  '0 0 20px rgba(61,126,255,0.4)',
                }}
              >
                Q{qNum}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="tag text-white/25 border-white/8"
                    style={{ background:'rgba(255,255,255,0.03)', fontSize:9 }}>
                    QUESTION {qNum} OF {MAX_QUESTIONS}
                  </span>
                  {done && (
                    <span className="tag text-success/75 border-success/22 bg-success/8">Complete</span>
                  )}
                </div>
                <p className="text-white/88 text-base leading-relaxed font-medium">{question}</p>
              </div>
            </div>
          </div>

          {/* Answer textarea */}
          {!done && (
            <div className="glass-card p-6 animate-slideIn" style={{ animationDelay:'0.06s', opacity:0 }}>
              <label className="block tag text-white/25 border-white/8 mb-3"
                style={{ background:'rgba(255,255,255,0.03)', fontSize:9 }}>
                YOUR ANSWER
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your answer here… Use specific examples from your experience. Ctrl+Enter to submit."
                rows={5}
                disabled={submitting}
                className="w-full rounded-xl p-4 text-sm"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-xs text-white/18">{answer.length} chars</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEnd}
                    disabled={ending || !sessionId}
                    className="btn-ghost text-xs px-4 py-2 rounded-lg text-white/40 hover:text-white/70"
                  >
                    {ending ? '…' : '🏁 End & report'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !answer.trim()}
                    className="btn-azure px-6 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        Scoring…
                      </>
                    ) : (
                      <>Submit <span className="opacity-45">→</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completion CTA */}
          {done && (
            <div className="glass-card p-8 text-center animate-slideIn"
              style={{ borderColor:'rgba(34,211,160,0.22)', background:'rgba(34,211,160,0.04)' }}>
              <div className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ background:'rgba(34,211,160,0.1)', borderColor:'rgba(34,211,160,0.25)' }}>
                🎉
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">All done!</h3>
              <p className="text-white/38 text-sm mb-6">
                All {MAX_QUESTIONS} questions answered. Your AI performance report is ready.
              </p>
              <button
                onClick={handleEnd}
                disabled={ending}
                className="btn-azure px-8 py-3 rounded-xl font-semibold text-sm text-white inline-flex items-center gap-2"
              >
                {ending ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Generating report…
                  </>
                ) : (
                  <>View My Report →</>
                )}
              </button>
            </div>
          )}

          {/* Feedback strip */}
          {feedback && (
            <div className="glass-card overflow-hidden animate-slideIn"
              style={{ animationDelay:'0.1s', opacity:0, borderColor:'rgba(61,126,255,0.22)' }}>
              <div className="h-px" style={{ background:'linear-gradient(90deg,#3D7EFF,#60EFFF)' }} />
              <div className="p-5">
                <p className="tag text-azure/75 border-azure/22 mb-2 block"
                  style={{ background:'rgba(61,126,255,0.06)', fontSize:9 }}>
                  AI FEEDBACK
                </p>
                <p className="text-white/65 text-sm leading-relaxed">{feedback}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl p-4 text-sm border"
              style={{ background:'rgba(255,87,87,0.07)', borderColor:'rgba(255,87,87,0.2)', color:'rgba(255,87,87,0.8)' }}>
              ⚠ {error}
            </div>
          )}

          {/* Conversation history */}
          <div className="glass-card flex flex-col overflow-hidden" style={{ maxHeight: 300 }}>
            <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between flex-shrink-0">
              <p className="tag text-white/25 border-white/8"
                style={{ background:'rgba(255,255,255,0.03)', fontSize:9 }}>
                CONVERSATION HISTORY
              </p>
              <span className="font-mono text-xs text-white/18">{history.length} entries</span>
            </div>

            <div ref={histRef} className="overflow-y-auto p-4 space-y-2.5 flex-1">
              {history.map((entry, i) => {
                if (entry.type === 'question') {
                  return (
                    <div key={i} className="flex gap-2.5">
                      <span className="font-mono font-bold text-xs text-azure flex-shrink-0 pt-0.5">
                        {entry.questionNumber ? `Q${entry.questionNumber}` : '◈'}
                      </span>
                      <p className="text-sm text-white/65 leading-relaxed">{entry.content}</p>
                    </div>
                  );
                }
                if (entry.type === 'answer') {
                  return (
                    <div key={i} className="flex gap-2.5 ml-4">
                      <span className="font-mono text-xs text-white/22 flex-shrink-0 pt-0.5">You</span>
                      <p className="text-xs text-white/38 leading-relaxed">{entry.content}</p>
                    </div>
                  );
                }
                if (entry.type === 'metrics' && entry.metrics) {
                  return (
                    <div key={i} className="ml-8 flex flex-wrap gap-1.5">
                      {METRIC_CONFIG.map((m) => (
                        <span key={m.key} className="tag"
                          style={{ color:m.color, borderColor:`${m.color}30`, background:`${m.color}10`, fontSize:10 }}>
                          {m.icon} {entry.metrics![m.key as MetricKey]}/10
                        </span>
                      ))}
                    </div>
                  );
                }
                if (entry.type === 'system') {
                  return (
                    <div key={i} className="text-center py-1">
                      <span className="font-mono text-xs text-success/55">{entry.content}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
