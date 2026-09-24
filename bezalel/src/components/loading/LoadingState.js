export default function LoadingState({ label = "Loading your workspace...", compact = false }) {
  return (
    <div className={`loading-state${compact ? " loading-state--compact" : ""}`} role="status" aria-live="polite" aria-busy="true">
      <div className="loading-state__label"><span className="loading-state__spinner" aria-hidden="true" />{label}</div>
      <div className="loading-state__skeleton" aria-hidden="true">
        <div /><div /><div />
      </div>
    </div>
  );
}
