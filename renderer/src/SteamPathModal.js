import React, { useEffect, useState } from 'react';
import styles from './SteamPathModal.module.css';
import FolderBadge from './FolderBadge';

export default function SteamPathModal({ open, onClose, onSetPath }) {
  const [savedPath, setSavedPath] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    window.electronAPI?.loadSteamPath().then((path) => {
      if (path) {
        setSavedPath(path);
        if (onSetPath) onSetPath(path);
      }
    });
  }, [open, onSetPath]);

  const handleSelectSteam = async () => {
    setError(null);
    const result = await window.electronAPI?.selectSteamFolder();
    if (result && result.error) {
      setError(result.error);
      return;
    }
    if (result && result.path) {
      await window.electronAPI.saveSteamPath(result.path);
      setSavedPath(result.path);
      if (onSetPath) onSetPath(result.path);
      // Kill Steam, install hid.dll and create folders
      const installResult = await window.electronAPI.installSteamResources(result.path);
      if (!installResult.success) {
        setError('Failed to install resources: ' + (installResult.error || 'Unknown error'));
        return;
      }
      if (onClose) onClose();
    }
  };

  const handleUninstall = async () => {
    if (savedPath) {
      const uninstallResult = await window.electronAPI.uninstallSteamResources(savedPath);
      if (!uninstallResult.success) {
        setError('Failed to uninstall resources: ' + (uninstallResult.error || 'Unknown error'));
        return;
      }
    }
    await window.electronAPI?.unsetSteamPath();
    setSavedPath(null);
    if (onSetPath) onSetPath(null);
    if (onClose) onClose();
  };



  if (!open) return null;
  return (
    <div className={styles.modalBackdrop} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles['modalCard--new']}>

        {/* Header */}
        <div className={styles['modalHeader--new']}>
          <div className={styles.headerTitleCentered}>Add SMI Installation</div>
        </div>
        {/* Error Message */}
        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}
        {/* Main Instruction */}
        <div className={styles.instructionSection}>
          <span className={styles.instructionText}>
            Select the folder containing the
            <FolderBadge text="Steam.exe" />
            and
            <FolderBadge text="Config" />
            directories.
          </span>
          <div className={styles.instructionSubtext}>
            Once selected, SMI will be installed to your Steam directory.
          </div>
        </div>
        {/* Path Box */}
        <div className={styles.pathBox}>
          {savedPath ? savedPath : 'No folder selected'}
        </div>

        {/* Footer Buttons */}
        <div className={styles.footerBtns}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          {savedPath ? (
            <button className={styles.uninstallBtn} onClick={handleUninstall}>Uninstall</button>
          ) : (
            <button className={styles.cancelBtn} onClick={handleSelectSteam}>Browse</button>
          )}
        </div>
      </div>
    </div>
  );
}
