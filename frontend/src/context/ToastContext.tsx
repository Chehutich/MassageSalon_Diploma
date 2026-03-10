import React, { createContext, useContext, useState, useCallback } from "react";
import { TopToast, ToastConfig } from "@/src/components/ui/feedback/TopToast";

type ToastContextType = {
  showToast: (
    type: "success" | "error",
    title: string,
    message: string,
  ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastConfig>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const showToast = useCallback(
    (type: "success" | "error", title: string, message: string) => {
      setToast({ visible: true, type, title, message });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <TopToast {...toast} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
