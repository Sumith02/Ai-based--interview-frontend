import type {
  StartResponse,
  AnswerResponse,
  QuestionDetail,
  ReportResponse,
} from '@/types/index';

// 🔴 Force env variable (no fallback)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const API = `${BASE_URL}/api`;

export const MAX_QUESTIONS = Number(process.env.NEXT_PUBLIC_MAX_QUESTIONS ?? 10);

// ─── helpers ──────────────────────────────────────────────────────────────────

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── endpoints ────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API}/health`, { cache: 'no-store' });
  return handleRes(res);
}

/**
 * POST /api/start
 * Accepts a multipart form with a single "file" field (PDF / TXT resume).
 */
export async function startInterview(file: File): Promise<StartResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/start`, { method: 'POST', body: form });
  return handleRes<StartResponse>(res);
}

/**
 * POST /api/answer
 * Body: { session_id: string, answer: string }
 */
export async function submitAnswer(
  sessionId: string,
  answer: string,
): Promise<AnswerResponse> {
  const res = await fetch(`${API}/answer`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ session_id: sessionId, answer }),
  });
  return handleRes<AnswerResponse>(res);
}

/**
 * POST /api/end
 * Body: { session_id: string }
 */
export async function endInterview(sessionId: string): Promise<ReportResponse> {
  const res = await fetch(`${API}/end`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ session_id: sessionId }),
  });
  return handleRes<ReportResponse>(res);
}

/**
 * GET /api/question/:sessionId/:questionNumber
 */
export async function getQuestion(
  sessionId: string,
  questionNumber: number,
): Promise<QuestionDetail> {
  const res = await fetch(`${API}/question/${sessionId}/${questionNumber}`);
  return handleRes<QuestionDetail>(res);
}
