import type { PropsWithChildren, ReactNode } from "react";
import { AppButton } from "@/app/components/common/AppButton";

type SelectionDialogFrameProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}>;

export function SelectionDialogFrame({
  children,
  description,
  footer,
  onClose,
  open,
  title,
  toolbar,
}: SelectionDialogFrameProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-8">
      <section className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.26)]">
        <header className="flex items-start justify-between px-7 pb-3 pt-7">
          <div className="space-y-2">
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#5669d8]">{title}</h2>
            <p className="text-[15px] text-[#7b8496]">{description}</p>
          </div>
          <AppButton
            aria-label="닫기"
            className="!min-h-9 !rounded-full !px-2.5 text-[#5b5b5b]"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <svg
              fill="none"
              height="20"
              viewBox="0 0 24 24"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </AppButton>
        </header>
        {toolbar ? <div className="px-7 pb-4">{toolbar}</div> : null}
        <div className="min-h-0 flex-1 overflow-auto px-7">{children}</div>
        {footer ? <footer className="px-7 pb-5 pt-4">{footer}</footer> : null}
      </section>
    </div>
  );
}
