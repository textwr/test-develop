type LoadingOverlayProps = {
  isVisible: boolean;
  message: string;
};

export function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-white/65 backdrop-blur-[1px]">
      <div className="grid min-w-64 justify-items-center gap-3 rounded-[12px] border border-[#d8dde6] bg-white px-6 py-5 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#dbe2ea] border-t-[#6175df]" />
        <p className="text-center text-[13px] text-[#475569]">{message}</p>
      </div>
    </div>
  );
}
