"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastMessage = {
  id: number;
  message: string;
  kind: "success" | "error";
};

type ToastContextValue = {
  notify: (message: string, kind?: ToastMessage["kind"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const notify = useCallback((message: string, kind: ToastMessage["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setMessages((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => {
      setMessages((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="toast-region" role="status">
        {messages.map((item) => (
          <div
            className={`toast${item.kind === "error" ? " toast-error" : ""}`}
            key={item.id}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
