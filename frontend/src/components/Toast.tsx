import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-600',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-custom-12 border ${colors[type]} shadow-lg animate-fade-in flex items-start gap-3 max-w-md`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button 
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-custom-8 hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
