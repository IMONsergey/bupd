export const clamp = (v, a, b) =>
  Math.min(b, Math.max(a, Number.isFinite(v) ? v : a));
export const smooth = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};
export function frameBudget(width, height, requestedDpr, quality = 'auto') {
  const low = quality === 'low' || (quality === 'auto' && width < 700);
  const cap = low ? 1 : 1.5,
    pixels = low ? 1200000 : 2600000;
  const dpr = Math.min(
    Math.max(0.5, requestedDpr || 1),
    cap,
    Math.sqrt(pixels / Math.max(1, width * height)),
  );
  return { low, dpr };
}
export function validateShots(data) {
  if (
    data?.schema !== 1 ||
    !Array.isArray(data.shots) ||
    data.shots.length !== 3
  )
    throw new Error('Expected three authored camera shots.');
  for (const shot of data.shots)
    for (const key of ['position', 'target']) {
      if (
        !Array.isArray(shot[key]) ||
        shot[key].length !== 3 ||
        !shot[key].every(Number.isFinite)
      )
        throw new Error('Invalid camera vector.');
    }
  return data.shots;
}
