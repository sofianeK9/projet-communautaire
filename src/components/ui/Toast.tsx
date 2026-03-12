"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const colors = {
  success: "border-emerald-500/40 bg-emerald-950/80 text-emerald-300",
  error: "border-red-500/40 bg-red-950/80 text-red-300",
  warning: "border-amber-500/40 bg-amber-950/80 text-amber-300",
};

const iconColors = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
};

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const Icon = icons[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl transition-all duration-300 ${colors[toast.type]} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${iconColors[toast.type]}`} />
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
        className="ml-2 opacity-60 hover:opacity-100 transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
