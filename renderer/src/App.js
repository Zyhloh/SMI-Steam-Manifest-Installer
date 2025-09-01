import './index.css';
import CustomTitleBar from './CustomTitleBar';
import SteamButton from './SteamButton';
import DragDropBox from './DragDropBox';
import GameDropdown from './GameDropdown';
// Theme: main=#141414, accent=#e6b800

import React, { useState, useRef } from 'react';
import SuccessToast from './SuccessToast';

function App() {
  const [steamPath, setSteamPath] = useState(null);

  React.useEffect(() => {
    window.electronAPI?.loadSteamPath().then((path) => {
      if (path) setSteamPath(path);
    });
  }, []);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const gameDropdownRef = useRef();

  // Listen for steamPath changes from SteamButton
  const handleSetPath = (path) => setSteamPath(path);

  // DragDropBox drop handler
  const handleDrop = async (files) => {
    if (!steamPath) {
      alert('Please set your Steam path first.');
      return;
    }
    if (!files.length) {
      alert('Please drop a manifest FOLDER.');
      return;
    }
    // Debug: log all dropped files
    console.log('Dropped files:', Array.from(files).map(f => f.name));
    const manifestFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.manifest'));
    const luaFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.lua'));
    console.log('Found .manifest:', manifestFiles.map(f => f.name));
    console.log('Found .lua:', luaFiles.map(f => f.name));
    if (manifestFiles.length === 0 || luaFiles.length === 0) {
      alert('Folder must contain at least one .lua and one .manifest file.');
      return;
    }
    // Read as base64
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const allFiles = [...manifestFiles, ...luaFiles];
      const filesData = await Promise.all(allFiles.map(async f => ({
        name: f.name,
        type: f.type,
        relativePath: f.webkitRelativePath,
        data: await toBase64(f)
      })));
      const result = await window.electronAPI.uploadManifestFiles(filesData, steamPath);
      if (result.success) {
        let msg = 'Manifest & Lua files copied successfully!';
        if (result.steamRestarted) {
          msg += ' Steam was restarted to apply changes.';
        }
        setToast({ show: true, message: msg });
        setRefreshKey(k => k + 1); // Refresh dropdown
      } else {
        alert(result.error || 'Upload failed.');
      }
    } catch (err) {
      alert(err.message || 'Upload failed.');
    }
  };

  const handleUninstall = async () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-main">
      <CustomTitleBar />
      <div className="flex-1 bg-main flex flex-col items-center">
        <DragDropBox onDrop={handleDrop} onInvalidDrop={msg => alert(msg)} />
        <SteamButton onSetPath={handleSetPath} />
        <SuccessToast message={toast.message} show={toast.show} onHide={() => setToast({ ...toast, show: false })} />
        <GameDropdown
          ref={gameDropdownRef}
          steamPath={steamPath}
          refreshKey={refreshKey}
          onUninstall={handleUninstall}
        />
      </div>
    </div>
  );
}

export default App;
