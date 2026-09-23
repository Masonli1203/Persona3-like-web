// Keep the click accent visible before the page transition covers the selected label.
export const PRESS_FEEDBACK_MS = 180;

export function playPressFeedback(link: HTMLElement) {
  const label = link.querySelector<HTMLElement>('[data-press-label]');
  if (!label) return null;
  const { color, textShadow } = getComputedStyle(label);
  const animation = label.animate(
    [
      {
        color: 'var(--press-red)',
        textShadow: '.09em .035em 0 var(--press-red), -.035em -.015em 0 var(--press-cyan)',
        offset: 0,
      },
      {
        color,
        textShadow: '.09em .035em 0 var(--press-red), -.035em -.015em 0 var(--press-cyan)',
        offset: 0.3,
      },
      {
        color,
        textShadow: '.035em .015em 0 var(--press-red), -.015em 0 0 var(--press-cyan)',
        offset: 0.7,
      },
      { color, textShadow, offset: 1 },
    ],
    { duration: PRESS_FEEDBACK_MS, easing: 'ease-out' },
  );
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stop = () => {
    if (preference.matches) animation.cancel();
  };
  const cleanup = () => preference.removeEventListener('change', stop);
  preference.addEventListener('change', stop);
  void animation.finished.then(cleanup, cleanup);
  return animation;
}
