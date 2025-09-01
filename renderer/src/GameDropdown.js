import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styles from './GameDropdown.module.css';

const GameDropdown = forwardRef(function GameDropdown({ steamPath, refreshKey = 0, onUninstall }, ref) {
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);

  const loadGames = () => {
    if (!steamPath) return;
    setLoading(true);
    window.electronAPI.listInstalledGames(steamPath).then((games) => {
      setGames(games);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadGames();
    // eslint-disable-next-line
  }, [steamPath, refreshKey]);

  useImperativeHandle(ref, () => ({
    refreshGames: loadGames
  }));

  const handleSelect = (e) => {
    setSelected(e.target.value);
  };

  const handleUninstall = async () => {
    if (!selected) return;
    const ok = window.confirm('Are you sure you want to uninstall this game and all its manifests?');
    if (!ok) return;
    const result = await window.electronAPI.uninstallGame(selected, steamPath);
    if (result.success) {
      setGames(games.filter(g => g.gameId !== selected));
      setSelected('');
      alert('Game and manifests uninstalled.');
      if (onUninstall) onUninstall();
    } else {
      alert(result.error || 'Failed to uninstall.');
    }
  };

  return (
    <div className={styles.dropdownContainer}>
      <label htmlFor="game-dropdown" className={styles.label}>Installed Games</label>
      <select
        id="game-dropdown"
        className={styles.select}
        value={selected}
        onChange={handleSelect}
        disabled={loading || !games.length}
      >
        <option value="">Select a game...</option>
        {games.map(g => (
          <option key={g.gameId} value={g.gameId}>{g.gameName}</option>
        ))}
      </select>
      {selected && (
        <button
          className={styles.button}
          onClick={handleUninstall}
        >
          Uninstall Selected Game
        </button>
      )}
    </div>
  );
});

export default GameDropdown;
