import { useCallback, useEffect, useState } from "react";

const MAX_WIDTH = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

export default function Modal({
  children,
  show = false,
  maxWidth = "2xl",
  closeable = true,
  onClose = () => {},
}) {
  const [render, setRender] = useState(show);
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => {
    if (closeable) onClose();
  }, [closeable, onClose]);

  // Mount/unmount with enter + leave transition
  useEffect(() => {
    if (show) {
      setRender(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setRender(false), 200);
    return () => clearTimeout(t);
  }, [show]);

  // Escape to close + lock body scroll while open
  useEffect(() => {
    if (!render) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [render, close]);

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center overflow-y-auto px-4 py-6 sm:px-0">
      <div
        className="absolute inset-0 bg-gray-500/75 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative mx-auto mb-6 w-full transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 ${MAX_WIDTH[maxWidth]}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(1rem) scale(0.95)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
