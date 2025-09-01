import React from 'react';
import WindowControls from './WindowControls';
// Theme: main=#141414, accent=#e6b800
export default function CustomTitleBar() {
  const handleWindow = (action) => {
    if (window.electronAPI) window.electronAPI.windowAction(action);
  };

  return (
    <>
      <div
        className="w-full flex items-center justify-between px-4 py-2 bg-main select-none rounded-t-xl border-b border-main/80"
        style={{ WebkitAppRegion: 'drag', userSelect: 'none' }}
      >
        <div
          className="text-accent"
          style={{
            fontFamily: `'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', 'system-ui', sans-serif`,
            fontWeight: 900,
            fontSize: '2.05rem',
            letterSpacing: '0.15em',
            textShadow: '0 2px 8px #0006, 0 1px 0 #fff1',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            userSelect: 'none',
          }}
        >
          SMI
        </div>
        <WindowControls
          onMinimize={() => handleWindow('minimize')}
          onClose={() => handleWindow('close')}
        />
      </div>
      {/* Sleek thin separator under title bar */}
      <div style={{
        width: '100%',
        height: '2.5px',
        background: 'linear-gradient(90deg, #e6b80033 0%, #fff1 100%)',
        boxShadow: '0 1px 6px 0 #0002',
        backdropFilter: 'blur(2.5px)',
        opacity: 0.92,
        marginTop: '-2px',
        marginBottom: '0.5rem',
        borderRadius: '0 0 1.5em 1.5em',
        pointerEvents: 'none',
      }} />
    </>
  );
}
