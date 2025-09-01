import React from 'react';
export default function FolderBadge({ text }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '2.5px',
      background: '#23272f', color: '#ffd86a',
      fontWeight: 600, fontSize: '0.97em',
      borderRadius: '0.44em', padding: '0.11em 0.55em',
      margin: '0 0.13em',
      boxShadow: '0 1px 2px 0 #0003',
      letterSpacing: '0.01em',
    }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{marginRight: '0.22em'}}>
        <rect x="1.5" y="5" width="12" height="7" rx="1.4" fill="#2d3138" stroke="#ffd86a" strokeWidth="1.1"/>
        <rect x="3.5" y="3" width="3.5" height="2.2" rx="0.7" fill="#23272f" stroke="#ffd86a" strokeWidth="0.9"/>
      </svg>
      {text}
    </span>
  );
}
