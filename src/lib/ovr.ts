export function careerIndexToOverall(ci: number): number {
  const overall = 0.05 * ci + 10;
  const clamped = Math.max(40, Math.min(99, overall));
  return Math.round(clamped);
}
