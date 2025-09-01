# SMI - Steam Manifest Installer

<div align="center">

![SMI Logo](resources/icon.ico)

**A powerful desktop application for managing Steam game manifests and installations**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-37.2.1-47848F.svg)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)

</div>

## Table of Contents

- [About](#about)
- [Disclaimer](#disclaimer)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Building](#building)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

## About

SMI (Steam Manifest Installer) is a modern Electron-based desktop application that simplifies the process of installing Steam games through manifest files. Built with React and styled with Tailwind CSS, SMI provides an intuitive drag-and-drop interface for managing Steam game installations without the need for traditional downloads.

### Why SMI?

- **Fast Installation**: Install games using pre-downloaded manifest files
- **Streamlined Process**: Simplifies game installation through manifest management
- **User-Friendly**: Simple drag-and-drop interface
- **Steam Integration**: Seamlessly integrates with your existing Steam installation
- **Modern UI**: Clean, responsive interface with custom window controls

## Disclaimer

⚠️ **IMPORTANT**: This software is provided for educational purposes only. The author is not responsible for how this software is used or any consequences that may arise from its use. Users are solely responsible for ensuring their use of this software complies with all applicable laws, terms of service, and licensing agreements. Use at your own risk.

## Features

- **Steam Path Detection**: Automatically detects and manages Steam installation paths
- **Drag & Drop Interface**: Simply drag manifest folders to install games
- **Game Management**: View and manage installed games through manifest files
- **Process Management**: Safely handles Steam process operations
- **Modern UI**: Frameless window with custom controls and smooth animations
- **Responsive Design**: Optimized for desktop use with fixed dimensions
- **Safe Operations**: Built-in safety checks for Steam directory operations

## Screenshots

> *Screenshots coming soon - the application features a sleek dark theme with yellow accents*

## Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Steam** installed on your system

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SMI.git
   cd SMI
   ```

2. **Install dependencies**
   ```bash
   # Install main application dependencies
   npm install
   
   # Install React renderer dependencies
   cd renderer
   npm install
   cd ..
   ```

3. **Run the application**
   ```bash
   npm start
   ```

## Usage

### First Time Setup

1. **Launch SMI** using `npm start`
2. **Set Steam Path**: Click the Steam button to select your Steam installation directory
3. **Verify Setup**: Ensure SMI can access your Steam folder

### Installing Games

1. **Prepare Manifest Files**: Ensure you have a folder containing:
   - `.manifest` files (game data)
   - `.lua` files (game configuration)

2. **Drag & Drop**: Simply drag the manifest folder onto the SMI interface

3. **Installation**: SMI will automatically:
   - Process the manifest files
   - Install game resources to Steam
   - Update your Steam library

### Managing Games

- **View Installed Games**: Use the game dropdown to see all installed games
- **Game Information**: View game details and installation status
- **Steam Integration**: Games appear in your Steam library automatically

## Development

### Project Structure

```
SMI/
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── package.json         # Main package configuration
├── resources/           # App resources (icons, DLLs)
│   ├── icon.ico
│   └── hid.dll
└── renderer/            # React frontend application
    ├── src/
    │   ├── App.js       # Main React component
    │   ├── components/  # UI components
    │   └── styles/      # CSS modules
    ├── public/          # Static assets
    └── package.json     # Renderer package configuration
```

### Development Commands

```bash
# Start development environment
npm start

# Start only React dev server
npm run start:react

# Start only Electron (requires React server)
npm run start:electron

# Run tests
cd renderer && npm test
```

### Tech Stack

- **Frontend**: React 19.1.0 with Tailwind CSS
- **Desktop Framework**: Electron 37.2.1
- **Build Tools**: React Scripts, Electron Builder
- **Styling**: Tailwind CSS with custom components
- **Process Management**: Node.js child processes

## Building

### Development Build

```bash
# Build React app for production
npm run build:react
```

### Distribution

```bash
# Create unpacked build in dist/ folder
npm run pack

# Create installer/executable for distribution
npm run dist
```

### Build Configuration

The application uses `electron-builder` with the following targets:

- **Windows**: NSIS installer with custom installation options
- **Output**: Portable executable and installer
- **Resources**: Includes app icon and required DLL files

## How It Works

### Architecture

SMI follows a typical Electron architecture:

1. **Main Process** (`main.js`): Handles system operations, file management, and Steam integration
2. **Renderer Process** (`renderer/`): React-based UI for user interaction
3. **Preload Script** (`preload.js`): Secure bridge between main and renderer processes

### Steam Integration

1. **Path Detection**: Locates Steam installation directory
2. **Manifest Processing**: Reads and processes `.lua` and `.manifest` files
3. **File Operations**: Copies game files to appropriate Steam directories
4. **Process Management**: Safely stops/starts Steam processes during installation

### Security Features

- **Context Isolation**: Enabled for secure renderer process
- **Node Integration**: Disabled in renderer for security
- **Preload Script**: Controlled API exposure to renderer

### File Processing

```javascript
// Example of manifest processing flow
1. User drops manifest folder
2. SMI validates file types (.lua, .manifest)
3. Files are read and encoded
4. Steam processes are safely terminated
5. Files are copied to Steam directories
6. Steam is restarted with new games available
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Ensure all builds pass before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Electron Team** for the amazing desktop framework
- **React Team** for the powerful UI library
- **Tailwind CSS** for the utility-first CSS framework
- **Steam Community** for manifest file format insights

---

<div align="center">

**Made with ❤️ by [Zyhloh](https://github.com/ZyhlohYT)**

*If you found this project helpful, please consider giving it a ⭐!*

</div>
