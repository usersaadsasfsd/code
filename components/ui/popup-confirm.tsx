"use client";
import { useState } from "react";

export function PopupConfirm({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 min-w-[320px]">
        <div className="mb-4 text-lg font-medium">{message}</div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700" onClick={onCancel}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// Helper for window.showPopupConfirm
let popupResolve: ((v: boolean) => void) | null = null;

export function PopupConfirmRoot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (typeof window !== "undefined" && !(window as any).showPopupConfirm) {
    (window as any).showPopupConfirm = (msg: string) => {
      setMessage(msg);
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        popupResolve = resolve;
      });
    };
  }

  const handleConfirm = () => {
    setOpen(false);
    popupResolve?.(true);
    popupResolve = null;
  };
  const handleCancel = () => {
    setOpen(false);
    popupResolve?.(false);
    popupResolve = null;
  };

  if (!open) return null;
  return <PopupConfirm message={message} onConfirm={handleConfirm} onCancel={handleCancel} />;
}
