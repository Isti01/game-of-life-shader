export function scheduleAnimationFrame(): Promise<number> {
  return new Promise(resolve => requestAnimationFrame(resolve));
}