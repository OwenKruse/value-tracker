/** CodingPlans mark: value (blue) above the 1x break-even diagonal, cost (ink) below it. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 32 32" fill="none" className="shrink-0">
      <path d="M5.5 5.5H22.4L5.5 22.4Z" fill="var(--accent)" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M26.5 9.6V26.5H9.6Z" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
