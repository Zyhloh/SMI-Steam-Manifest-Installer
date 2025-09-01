const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 750,
    minWidth: 1200,
    minHeight: 750,
    maxWidth: 1200,
    maxHeight: 750,
    resizable: false,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'resources', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'renderer', 'build', 'index.html'));
  } else {
    win.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

const getSteamPathFile = () => {
  const userData = app.getPath('userData');
  return path.join(userData, 'steam-path.json');
};

ipcMain.handle('select-steam-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const folder = result.filePaths[0];
  const hasSteamExe = fs.existsSync(path.join(folder, 'steam.exe'));
  const hasConfig = fs.existsSync(path.join(folder, 'config')) && fs.lstatSync(path.join(folder, 'config')).isDirectory();
  if (!hasSteamExe || !hasConfig) {
    return { error: 'Not a valid Steam installation path' };
  }
  return { path: folder };
});

ipcMain.handle('save-steam-path', async (event, steamPath) => {
  const file = getSteamPathFile();
  fs.writeFileSync(file, JSON.stringify({ steamPath }), 'utf-8');
  return true;
});

ipcMain.handle('unset-steam-path', async () => {
  const file = getSteamPathFile();
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
  return true;
});

const { execSync } = require('child_process');

function killSteamProcesses() {
  try {
    // Windows: force kill all steam.exe processes and children
    console.log('[SMI] Attempting to kill Steam processes...');
    const out = execSync('taskkill /F /IM steam.exe /T');
    console.log('[SMI] taskkill output:', out.toString());
  } catch (e) {
    console.error('[SMI] taskkill error:', e.message);
  }
}

ipcMain.handle('install-steam-resources', async (event, steamPath) => {
  try {
    killSteamProcesses();
    const dllSrc = path.join(__dirname, 'resources', 'hid.dll');
    const dllDest = path.join(steamPath, 'hid.dll');
    fs.copyFileSync(dllSrc, dllDest);

    const configDir = path.join(steamPath, 'config');
    const depotcacheDir = path.join(configDir, 'depotcache');
    const stpluginDir = path.join(configDir, 'stplug-in');
    if (!fs.existsSync(depotcacheDir)) fs.mkdirSync(depotcacheDir, { recursive: true });
    if (!fs.existsSync(stpluginDir)) fs.mkdirSync(stpluginDir, { recursive: true });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('uninstall-steam-resources', async (event, steamPath) => {
  try {
    killSteamProcesses();
    const dllPath = path.join(steamPath, 'hid.dll');
    const depotcacheDir = path.join(steamPath, 'config', 'depotcache');
    const stpluginDir = path.join(steamPath, 'config', 'stplug-in');
    if (fs.existsSync(dllPath)) fs.unlinkSync(dllPath);
    if (fs.existsSync(depotcacheDir)) fs.rmSync(depotcacheDir, { recursive: true, force: true });
    if (fs.existsSync(stpluginDir)) fs.rmSync(stpluginDir, { recursive: true, force: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('copy-manifest-files', async (event, folderPath, steamPath) => {
  try {
    if (!folderPath || typeof folderPath !== 'string' || !fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
      return { success: false, error: 'Dropped item is not a valid folder.' };
    }
    const stpluginDir = path.join(steamPath, 'config', 'stplug-in');
    const depotcacheDir = path.join(steamPath, 'config', 'depotcache');
    if (!fs.existsSync(stpluginDir)) fs.mkdirSync(stpluginDir, { recursive: true });
    if (!fs.existsSync(depotcacheDir)) fs.mkdirSync(depotcacheDir, { recursive: true });
    const files = fs.readdirSync(folderPath);
    const luaFiles = files.filter(f => f.toLowerCase().endsWith('.lua'));
    const manifestFiles = files.filter(f => f.toLowerCase().endsWith('.manifest'));
    if (luaFiles.length === 0 || manifestFiles.length === 0) {
      return { success: false, error: 'Folder must contain at least one .lua and one .manifest file.' };
    }
    for (const file of luaFiles) {
      fs.copyFileSync(path.join(folderPath, file), path.join(stpluginDir, file));
    }
    for (const file of manifestFiles) {
      fs.copyFileSync(path.join(folderPath, file), path.join(depotcacheDir, file));
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

const { spawn } = require('child_process');

function isSteamRunning() {
  try {
    // Windows: check for steam.exe in process list
    const out = execSync('tasklist /FI "IMAGENAME eq steam.exe"').toString();
    return out.toLowerCase().includes('steam.exe');
  } catch (e) {
    return false;
  }
}

// List all installed games (from .lua files in stplug-in)
ipcMain.handle('list-installed-games', async (event, steamPath) => {
  try {
    const stpluginDir = path.join(steamPath, 'config', 'stplug-in');
    const depotcacheDir = path.join(steamPath, 'config', 'depotcache');
    if (!fs.existsSync(stpluginDir)) return [];
    const luaFiles = fs.readdirSync(stpluginDir).filter(f => f.endsWith('.lua'));
    const games = [];
    const gameNameCache = {};
    const https = require('https');
    // Helper to fetch game name async
    function fetchGameName(appid) {
      return new Promise((resolve) => {
        if (gameNameCache[appid]) return resolve(gameNameCache[appid]);
        const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
        https.get(url, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed && parsed[appid] && parsed[appid].success && parsed[appid].data && parsed[appid].data.name) {
                gameNameCache[appid] = parsed[appid].data.name;
                resolve(parsed[appid].data.name);
              } else {
                resolve(null);
              }
            } catch (e) { resolve(null); }
          });
        }).on('error', () => resolve(null));
      });
    }
    // First pass: parse all info, collect missing names
    const missingAppids = [];
    const gameObjs = luaFiles.map(luaFile => {
      const luaPath = path.join(stpluginDir, luaFile);
      const content = fs.readFileSync(luaPath, 'utf-8');
      let gameName = null;
      let gameId = null;
      let manifestIds = [];
      let manifestFiles = [];
      const nameMatch = content.match(/^--\s*Name:\s*(.+)$/m);
      if (nameMatch) gameName = nameMatch[1].trim();
      const mainAppMatch = content.match(/^addappid\((\d+)\).*--\s*(.+)$/m);
      if (mainAppMatch) {
        gameId = mainAppMatch[1];
        if (!gameName) gameName = mainAppMatch[2].trim();
      }
      if (!gameName) {
        const firstAppidMatch = content.match(/addappid\((\d+)\)/);
        if (firstAppidMatch) {
          gameId = firstAppidMatch[1];
          missingAppids.push(gameId);
        }
      }
      const manifestIdMatches = [...content.matchAll(/setManifestid\((\d+),\s*\"(\d+)\"/g)];
      manifestIds = manifestIdMatches.map(m => m[2]);
      if (fs.existsSync(depotcacheDir)) {
        const depotFiles = fs.readdirSync(depotcacheDir).filter(f => f.endsWith('.manifest'));
        manifestFiles = depotFiles.filter(f => manifestIds.some(id => f.includes(id)));
      }
      return { gameId, gameName, luaFile, manifestIds, manifestFiles };
    });
    // Fetch all missing names in parallel
    const appidToName = {};
    await Promise.all(missingAppids.map(async appid => {
      const name = await fetchGameName(appid);
      if (name) appidToName[appid] = name;
    }));
    // Build final games list
    for (const g of gameObjs) {
      let gameName = g.gameName;
      if (!gameName && g.gameId && appidToName[g.gameId]) gameName = appidToName[g.gameId];
      if (gameName && g.gameId) {
        games.push({ ...g, gameName });
      }
    }
    return games;
  } catch (err) {
    return [];
  }
});


// Uninstall a game: delete .lua and all associated .manifest files
ipcMain.handle('uninstall-game', async (event, gameId, steamPath) => {
  try {
    const stpluginDir = path.join(steamPath, 'config', 'stplug-in');
    const depotcacheDir = path.join(steamPath, 'config', 'depotcache');
    // Find manifestIds for this game
    let manifestIds = [];
    const luaFiles = fs.readdirSync(stpluginDir).filter(f => f.endsWith('.lua'));
    for (const luaFile of luaFiles) {
      const luaPath = path.join(stpluginDir, luaFile);
      const content = fs.readFileSync(luaPath, 'utf-8');
      if (content.includes(`addappid(${gameId})`)) {
        // Extract manifestIds from this file
        const manifestIdMatches = [...content.matchAll(/setManifestid\((\d+),\s*\"(\d+)\"/g)];
        manifestIds.push(...manifestIdMatches.map(m => m[2]));
        fs.unlinkSync(luaPath);
      }
    }
    // Delete manifest files for those manifestIds
    if (fs.existsSync(depotcacheDir) && manifestIds.length > 0) {
      const depotFiles = fs.readdirSync(depotcacheDir).filter(f => f.endsWith('.manifest'));
      for (const file of depotFiles) {
        if (manifestIds.some(id => file.includes(id))) {
          fs.unlinkSync(path.join(depotcacheDir, file));
        }
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('upload-manifest-files', async (event, files, steamPath) => {
  try {
    if (!Array.isArray(files) || !steamPath) {
      return { success: false, error: 'Invalid files or steamPath.' };
    }
    const wasSteamRunning = isSteamRunning();
    if (wasSteamRunning) {
      killSteamProcesses();
    }
    const stpluginDir = path.join(steamPath, 'config', 'stplug-in');
    const depotcacheDir = path.join(steamPath, 'config', 'depotcache');
    if (!fs.existsSync(stpluginDir)) fs.mkdirSync(stpluginDir, { recursive: true });
    if (!fs.existsSync(depotcacheDir)) fs.mkdirSync(depotcacheDir, { recursive: true });
    const luaFiles = files.filter(f => f.name.toLowerCase().endsWith('.lua'));
    const manifestFiles = files.filter(f => f.name.toLowerCase().endsWith('.manifest'));
    if (luaFiles.length === 0 || manifestFiles.length === 0) {
      return { success: false, error: 'Upload must include at least one .lua and one .manifest file.' };
    }
    // Write files
    for (const file of luaFiles) {
      const dest = path.join(stpluginDir, file.name);
      const buffer = Buffer.from(file.data, 'base64');
      fs.writeFileSync(dest, buffer);
    }
    for (const file of manifestFiles) {
      const dest = path.join(depotcacheDir, file.name);
      const buffer = Buffer.from(file.data, 'base64');
      fs.writeFileSync(dest, buffer);
    }
    // Restart Steam if it was running
    if (wasSteamRunning) {
      const steamExe = path.join(steamPath, 'steam.exe');
      console.log('[SMI] Attempting to restart Steam:', steamExe);
      if (fs.existsSync(steamExe)) {
        try {
          spawn(steamExe, [], { detached: true, stdio: 'ignore' }).unref();
          console.log('[SMI] Steam restart command issued.');
        } catch (err) {
          console.error('[SMI] Failed to restart Steam:', err);
        }
      } else {
        console.error('[SMI] steam.exe does not exist at:', steamExe);
      }
    }
    return { success: true, steamRestarted: wasSteamRunning };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-steam-path', async () => {
  const file = getSteamPathFile();
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return data.steamPath;
  }
  return null;
});

ipcMain.on('window-action', (event, action) => {
  if (!win) return;
  switch (action) {
    case 'minimize':
      win.minimize();
      break;
    case 'maximize':
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      break;
    case 'close':
      win.close();
      break;
    default:
      break;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
