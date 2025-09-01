import React, { useState } from 'react';
import styles from './SteamButton.module.css';
import SteamPathModal from './SteamPathModal';

export default function SteamButton({ onSetPath }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [steamPath, setSteamPath] = useState(null);

  React.useEffect(() => {
    window.electronAPI?.loadSteamPath().then((path) => {
      if (path) setSteamPath(path);
    });
  }, []);

  const handleSetPath = (path) => {
    setSteamPath(path);
    if (onSetPath) onSetPath(path);
    // Only close the modal if the user just picked a new path
    // (otherwise, allow modal to open/close independently)
    // setModalOpen(false);
  };


  return (
    <>
      <button
        className={`${styles.steamBtn} ${steamPath ? styles.pulseGreen : styles.pulseRed}`}
        aria-label="Steam Button"
        onClick={() => setModalOpen(true)}
      >
        <img
          src={process.env.PUBLIC_URL + '/images/steam.png'}
          alt="Steam"
          className={styles.steamBtnImg}
          draggable="false"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </button>
      <SteamPathModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSetPath={handleSetPath}
      />
    </>
  );
}
