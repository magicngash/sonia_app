import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle, 
  X, 
  Bell, 
  Sparkles,
  Repeat
} from 'lucide-react';
import { AppToast } from '../../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div 
      aria-live="assertive"
      className="fixed bottom-4 right-4 sm:top-20 sm:bottom-auto z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: AppToast;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 4500;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />,
          borderColor: 'border-emerald-200',
          bgColor: 'bg-emerald-50/95',
          progressColor: 'bg-emerald-500',
          titleColor: 'text-emerald-950',
          textColor: 'text-emerald-800',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
          borderColor: 'border-amber-200',
          bgColor: 'bg-amber-50/95',
          progressColor: 'bg-amber-500',
          titleColor: 'text-amber-950',
          textColor: 'text-amber-800',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />,
          borderColor: 'border-rose-200',
          bgColor: 'bg-rose-50/95',
          progressColor: 'bg-rose-500',
          titleColor: 'text-rose-950',
          textColor: 'text-rose-800',
        };
      case 'info':
      default:
        return {
          icon: <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />,
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50/95',
          progressColor: 'bg-blue-500',
          titleColor: 'text-blue-950',
          textColor: 'text-blue-800',
        };
    }
  };

  const style = getStyle();

  return (
    <div 
      className={`pointer-events-auto w-full bg-white rounded-xl shadow-lg border ${style.borderColor} overflow-hidden backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-right-4 fade-in`}
    >
      <div className="p-3.5 flex items-start space-x-3">
        {style.icon}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between">
            <h5 className={`text-xs font-bold leading-tight ${style.titleColor}`}>
              {toast.title}
            </h5>
            <span className="text-[10px] text-slate-400 font-mono ml-2">
              {toast.timestamp}
            </span>
          </div>
          {toast.message && (
            <p className={`text-xs mt-1 leading-relaxed ${style.textColor}`}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded-md"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown indicator */}
      <div className="h-1 w-full bg-slate-100 overflow-hidden">
        <div 
          className={`h-full ${style.progressColor} transition-all ease-linear`}
          style={{
            animation: `toastProgress ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
