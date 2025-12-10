// [.SYSTEMS.T.SYSTEMS.] Electron Preload Script
// Sicherer Bridge zwischen Main und Renderer Process

const { contextBridge } = require('electron');

// Exponiere sichere APIs für Renderer
contextBridge.exposeInMainWorld('electronAPI', {
	platform: process.platform,
	versions: {
		node: process.versions.node,
		chrome: process.versions.chrome,
		electron: process.versions.electron
	},
	
	// Platform Info
	getPlatform: () => {
		return process.platform;
	}
});

console.log('[FABRIKAGE] Electron: Preload script loaded');
