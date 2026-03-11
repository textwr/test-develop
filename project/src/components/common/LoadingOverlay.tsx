type LoadingOverlayProps = {
  isVisible: boolean;
  message: string;
};

export function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="loading-overlay"
      role="status"
    >
      <div className="loading-overlay__content">
        <span className="loading-overlay__spinner" />
        <p className="loading-overlay__message">{message}</p>
      </div>
    </div>
  );
}
