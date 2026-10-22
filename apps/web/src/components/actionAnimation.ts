export const ACTION_PULSE_DURATION_MS = 600;
export const ACTION_PULSE_STAGGER_MS = 180;

export function actionRevealDuration(actionCount: number): number {
  const pulseCount = Math.max(1, actionCount);
  return ACTION_PULSE_DURATION_MS + (pulseCount - 1) * ACTION_PULSE_STAGGER_MS + 200;
}
