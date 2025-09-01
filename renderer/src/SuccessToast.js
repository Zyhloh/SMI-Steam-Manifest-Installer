import React, { useEffect } from 'react';
import styles from './SuccessToast.module.css';

export default function SuccessToast({ message, show, duration = 2600, onHide }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onHide?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onHide]);

  if (!show) return null;
  return (
    <div className={styles.toast}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{marginRight: '0.7em'}}><circle cx="11" cy="11" r="10" fill="#1f3d1f" stroke="#22c55e" strokeWidth="2.3"/><path d="M7 11.5l3 3 5-6" stroke="#22c55e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {message}
    </div>
  );
}
