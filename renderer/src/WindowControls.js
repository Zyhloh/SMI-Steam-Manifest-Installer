import React from 'react';
import styles from './WindowControls.module.css';

export default function WindowControls({ onMinimize, onClose }) {
  return (
    <div className={styles.windowControls} style={{ WebkitAppRegion: 'no-drag' }}>
      <button
        className={styles.ctrlBtn}
        title="Minimize"
        onClick={onMinimize}
      >
        <svg className={styles.ctrlIcon} viewBox="0 0 22 22" fill="none">
          <rect x="5.5" y="10.3" width="11" height="2.2" rx="1.1" fill="#e6e6e6" />
        </svg>
      </button>
      <button
        className={styles.ctrlBtn + ' ' + styles.close}
        title="Close"
        onClick={onClose}
      >
        <svg className={styles.ctrlIcon} viewBox="0 0 22 22" fill="none">
          <line x1="6" y1="6" x2="16" y2="16" />
          <line x1="16" y1="6" x2="6" y2="16" />
        </svg>
      </button>
    </div>
  );
}
