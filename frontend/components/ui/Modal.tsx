"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export default function Modal({ open, onClose, title, children, maxWidthClass = "max-w-md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-2xl bg-card text-foreground shadow-2xl animate-in`}
      >
        <div className="sticky top-0 flex items-center justify-center border-b border-border bg-card px-4 py-4 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute left-4 rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          {title && <h2 className="text-base font-semibold">{title}</h2>}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
