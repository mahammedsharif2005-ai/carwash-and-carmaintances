import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import './Toast.css';

export const Toast = ({
  message,
  title = 'Backend Connection Alert',
  type = 'error',
  onClose,
  duration = 7000,
}) => {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);

    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  return (
    <div className={`toast-wrapper toast-${type}`} role="alert" aria-live="assertive">
      <div className="toast-card">
        <div className="toast-icon-box">
          {type === 'error' && <AlertTriangle size={20} />}
          {type === 'success' && <CheckCircle2 size={20} />}
          {type === 'info' && <Info size={20} />}
        </div>
        <div className="toast-body">
          {title && <strong className="toast-title">{title}</strong>}
          <p className="toast-message">{message}</p>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
        {duration > 0 && (
          <div
            className="toast-progress-bar"
            style={{ animationDuration: `${duration}ms` }}
          />
        )}
      </div>
    </div>
  );
};
