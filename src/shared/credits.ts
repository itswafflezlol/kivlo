/** 1 credit = up to 20 minutes of source video (PRD §6). */
export const CREDIT_SECONDS = 20 * 60;

export function creditsFor(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 1;
  return Math.ceil(seconds / CREDIT_SECONDS);
}
