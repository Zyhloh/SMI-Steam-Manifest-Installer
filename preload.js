const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  windowAction: (action) => ipcRenderer.send('window-action', action),
  selectSteamFolder: () => ipcRenderer.invoke('select-steam-folder'),
  saveSteamPath: (path) => ipcRenderer.invoke('save-steam-path', path),
  loadSteamPath: () => ipcRenderer.invoke('load-steam-path'),
  unsetSteamPath: () => ipcRenderer.invoke('unset-steam-path'),
  installSteamResources: (path) => ipcRenderer.invoke('install-steam-resources', path),
  uninstallSteamResources: (path) => ipcRenderer.invoke('uninstall-steam-resources', path),
  copyManifestFiles: (folderPath, steamPath) => ipcRenderer.invoke('copy-manifest-files', folderPath, steamPath),
  uploadManifestFiles: (files, steamPath) => ipcRenderer.invoke('upload-manifest-files', files, steamPath),
  listInstalledGames: (steamPath) => ipcRenderer.invoke('list-installed-games', steamPath),
  uninstallGame: (gameId, steamPath) => ipcRenderer.invoke('uninstall-game', gameId, steamPath),
});
