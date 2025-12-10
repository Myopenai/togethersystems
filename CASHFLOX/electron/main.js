// [.SYSTEMS.T.SYSTEMS.] Electron Main Process
// TogetherSystems Hub - Desktop Application

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1400,
		height: 900,
		minWidth: 800,
		minHeight: 600,
		backgroundColor: '#0f1419',
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			webSecurity: true,
			preload: path.join(__dirname, 'preload.js')
		},
		icon: path.join(__dirname, '../icons/icon.png'),
		title: 'TogetherSystems Hub',
		show: false
	});

	// Lade die App
	const startUrl = path.join(__dirname, '../TOGETHERSYSTEMS-HUB.html');
	mainWindow.loadFile(startUrl);

	// Zeige Fenster wenn bereit
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		console.log('[FABRIKAGE] Electron: Window ready');
	});

	// Öffne externe Links im Browser
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: 'deny' };
	});

	// DevTools in Development
	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

// App Menu
function createMenu() {
	const template = [
		{
			label: 'Datei',
			submenu: [
				{
					label: 'Neu',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						mainWindow.webContents.send('menu-new');
					}
				},
				{ type: 'separator' },
				{
					label: 'Beenden',
					accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
					click: () => {
						app.quit();
					}
				}
			]
		},
		{
			label: 'Ansicht',
			submenu: [
				{
					label: 'Neu laden',
					accelerator: 'CmdOrCtrl+R',
					click: () => {
						mainWindow.reload();
					}
				},
				{
					label: 'Vollständig neu laden',
					accelerator: 'CmdOrCtrl+Shift+R',
					click: () => {
						mainWindow.webContents.reloadIgnoringCache();
					}
				},
				{ type: 'separator' },
				{
					label: 'Vergrößern',
					accelerator: 'CmdOrCtrl+Plus',
					click: () => {
						mainWindow.webContents.zoomLevel += 0.5;
					}
				},
				{
					label: 'Verkleinern',
					accelerator: 'CmdOrCtrl+-',
					click: () => {
						mainWindow.webContents.zoomLevel -= 0.5;
					}
				},
				{
					label: 'Zurücksetzen',
					accelerator: 'CmdOrCtrl+0',
					click: () => {
						mainWindow.webContents.zoomLevel = 0;
					}
				},
				{ type: 'separator' },
				{
					label: 'Vollbild',
					accelerator: 'F11',
					click: () => {
						mainWindow.setFullScreen(!mainWindow.isFullScreen());
					}
				}
			]
		},
		{
			label: 'Apps',
			submenu: [
				{
					label: 'Kassenbuch',
					click: () => {
						mainWindow.loadFile(path.join(__dirname, '../Kassenbuch/kassenbuch.html'));
					}
				},
				{
					label: 'Budget',
					click: () => {
						mainWindow.loadFile(path.join(__dirname, '../budget.html'));
					}
				},
				{
					label: 'Contract',
					click: () => {
						mainWindow.loadFile(path.join(__dirname, '../contract.html'));
					}
				},
				{
					label: 'Flowcashx',
					click: () => {
						mainWindow.loadFile(path.join(__dirname, '../FLOCASHX.HTML'));
					}
				},
				{
					label: 'Hub',
					click: () => {
						mainWindow.loadFile(path.join(__dirname, '../TOGETHERSYSTEMS-HUB.html'));
					}
				}
			]
		},
		{
			label: 'Hilfe',
			submenu: [
				{
					label: 'Über',
					click: () => {
						shell.openExternal('https://myopenai.github.io/togethersystems');
					}
				}
			]
		}
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

// App Events
app.whenReady().then(() => {
	createWindow();
	createMenu();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	console.log('[FABRIKAGE] Electron: App ready');
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// Security: Verhindere Navigation zu externen URLs
app.on('web-contents-created', (event, contents) => {
	contents.on('will-navigate', (event, navigationUrl) => {
		const parsedUrl = new URL(navigationUrl);
		if (parsedUrl.origin !== 'file://') {
			event.preventDefault();
		}
	});
});

console.log('[FABRIKAGE] Electron: Main process loaded');
