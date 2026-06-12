import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ────────────────────────────── Types ────────────────────────────── */

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  open: boolean;
  message: string;
  type: AlertType;
}

interface ConfirmState {
  open: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

interface DialogContextValue {
  showAlert: (message: string, type?: AlertType) => void;
  showConfirm: (message: string) => Promise<boolean>;
}

/* ────────────────────────────── Context ────────────────────────────── */

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = (): DialogContextValue => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a <DialogProvider>');
  }
  return ctx;
};

/* ────────────────────────── Icon + Color map ────────────────────────── */

const iconMap: Record<AlertType, React.ReactNode> = {
  success: <CheckCircle2 className="h-7 w-7 text-emerald-500" />,
  error: <XCircle className="h-7 w-7 text-rose-500" />,
  warning: <AlertTriangle className="h-7 w-7 text-amber-500" />,
  info: <Info className="h-7 w-7 text-[#2874f0]" />,
};

const ringMap: Record<AlertType, string> = {
  success: 'bg-emerald-50',
  error: 'bg-rose-50',
  warning: 'bg-amber-50',
  info: 'bg-blue-50',
};

const titleMap: Record<AlertType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Notice',
};

/* ────────────────────── Shared backdrop + panel ────────────────────── */

interface OverlayProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ visible, onClose, children }) => {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Force a reflow before starting the animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200 ${
        animating ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-200 ${
          animating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

/* ────────────────────────── AlertDialog ────────────────────────── */

interface AlertDialogProps {
  state: AlertState;
  onClose: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ state, onClose }) => {
  // Close on Escape
  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.open, onClose]);

  return (
    <Overlay visible={state.open} onClose={onClose}>
      {/* Close icon */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="px-6 pt-7 pb-6 flex flex-col items-center text-center">
        {/* Icon ring */}
        <div className={`flex items-center justify-center h-14 w-14 rounded-full ${ringMap[state.type]} mb-4`}>
          {iconMap[state.type]}
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1.5">{titleMap[state.type]}</h3>
        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{state.message}</p>
      </div>

      <div className="px-6 pb-5">
        <button
          onClick={onClose}
          autoFocus
          className="w-full py-2.5 bg-[#2874f0] hover:bg-[#1a5dc7] text-white text-sm font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#2874f0]/40"
        >
          OK
        </button>
      </div>
    </Overlay>
  );
};

/* ────────────────────────── ConfirmDialog ────────────────────────── */

interface ConfirmDialogProps {
  state: ConfirmState;
  onResult: (value: boolean) => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ state, onResult }) => {
  // Close on Escape → cancel
  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResult(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.open, onResult]);

  return (
    <Overlay visible={state.open} onClose={() => onResult(false)}>
      <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center">
        {/* Warning icon */}
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-amber-50 mb-4">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1.5">Are you sure?</h3>
        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{state.message}</p>
      </div>

      <div className="px-6 pb-5 flex gap-3">
        <button
          onClick={() => onResult(false)}
          className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onResult(true)}
          autoFocus
          className="flex-1 py-2.5 bg-[#2874f0] hover:bg-[#1a5dc7] text-white text-sm font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#2874f0]/40"
        >
          Confirm
        </button>
      </div>
    </Overlay>
  );
};

/* ────────────────────────── Provider ────────────────────────── */

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    type: 'info',
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    message: '',
    resolve: null,
  });

  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    setAlertState({ open: true, message, type });
  }, []);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmState({ open: true, message, resolve });
    });
  }, []);

  const handleAlertClose = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirmResult = useCallback((value: boolean) => {
    setConfirmState((prev) => ({ ...prev, open: false }));
    if (confirmResolveRef.current) {
      confirmResolveRef.current(value);
      confirmResolveRef.current = null;
    }
  }, []);

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertDialog state={alertState} onClose={handleAlertClose} />
      <ConfirmDialog state={confirmState} onResult={handleConfirmResult} />
    </DialogContext.Provider>
  );
};
