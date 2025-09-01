import React, { useRef, useState } from 'react';
import styles from './DragDropBox.module.css';

export default function DragDropBox({ onDrop, onInvalidDrop }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  // Recursively traverse a directory entry and collect all File objects
  const traverseFileTree = (item, path = '') => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          file.fullPath = path + file.name;
          resolve([file]);
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries) => {
          const files = await Promise.all(entries.map(entry => traverseFileTree(entry, path + item.name + '/')));
          resolve([].concat(...files));
        });
      } else {
        resolve([]);
      }
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      const items = Array.from(e.dataTransfer.items);
      // Only accept folders
      const folderItem = items.find(item => item.kind === 'file' && item.webkitGetAsEntry && item.webkitGetAsEntry().isDirectory);
      if (!folderItem) {
        // Check for older browsers or if user dropped a file
        const allAreFiles = items.every(item => item.kind === 'file');
        if (allAreFiles) {
          onInvalidDrop?.('You must drop a FOLDER, not individual files or zips.');
        } else {
          onInvalidDrop?.('Drag and drop a folder containing your manifest files.');
        }
        return;
      }
      const entry = folderItem.webkitGetAsEntry();
      if (!entry || !entry.isDirectory) {
        onInvalidDrop?.('You must drop a folder, not a file.');
        return;
      }
      const files = await traverseFileTree(entry);
      if (!files.length) {
        onInvalidDrop?.('No files found in dropped folder.');
        return;
      }
      onDrop?.(files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className={styles.dropBox + (dragActive ? ' ' + styles.active : '')}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      tabIndex={0}
      role="button"
      aria-label="Drag and drop a manifest folder or zip file"
    >
      <div className={styles.iconRow}>
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none"><rect x="3" y="9" width="32" height="20" rx="5" fill="#23272f" stroke="#e6b800" strokeWidth="1.5"/><path d="M19 13v10" stroke="#e6b800" strokeWidth="2.2" strokeLinecap="round"/><path d="M15.5 19.5L19 23l3.5-3.5" stroke="#e6b800" strokeWidth="2.2" strokeLinecap="round"/></svg>
      </div>
      <div className={styles.dropText}>Drag & Drop A Manifest Folder Here</div>
      <div className={styles.dropSubtext}>Only folders with .lua & .manifest files accepted</div>
    </div>
  );
}
