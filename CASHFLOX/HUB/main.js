// [.SYSTEMS.T.SYSTEMS.] CASHFLOX HUB - Electron Main Process

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1400,
		height: 900,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			webSecurity: true
		},
		icon: path.join(__dirname, 'assets', 'icon.png'),
		title: 'CASHFLOX Hub - [.SYSTEMS.T.SYSTEMS.]',
		backgroundColor: '#0a0e1a',
		show: false
	});
	
	// Lade die Hub-Seite
	mainWindow.loadFile('index.html');
	
	// Zeige Fenster wenn bereit
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
	
	// Entwicklertools (nur im Development)
	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools();
	}
	
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

// Menü erstellen
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
			label: 'Apps',
			submenu: [
				{
					label: 'Kassenbuch',
					accelerator: 'CmdOrCtrl+1',
					click: () => {
						mainWindow.webContents.send('open-app', 'kassenbuch');
					}
				},
				{
					label: 'Budget',
					accelerator: 'CmdOrCtrl+2',
					click: () => {
						mainWindow.webContents.send('open-app', 'budget');
					}
				},
				{
					label: 'Contract',
					accelerator: 'CmdOrCtrl+3',
					click: () => {
						mainWindow.webContents.send('open-app', 'contract');
					}
				},
				{
					label: 'Flowcashx',
					accelerator: 'CmdOrCtrl+4',
					click: () => {
						mainWindow.webContents.send('open-app', 'flowcashx');
					}
				},
				{
					label: 'UAE / Chflox',
					accelerator: 'CmdOrCtrl+5',
					click: () => {
						mainWindow.webContents.send('open-app', 'uae');
					}
				}
			]
		},
		{
			label: 'Ansicht',
			submenu: [
				{ role: 'reload', label: 'Neu laden' },
				{ role: 'forceReload', label: 'Erzwingen neu laden' },
				{ role: 'toggleDevTools', label: 'Entwicklertools' },
				{ type: 'separator' },
				{ role: 'resetZoom', label: 'Zoom zurücksetzen' },
				{ role: 'zoomIn', label: 'Vergrößern' },
				{ role: 'zoomOut', label: 'Verkleinern' },
				{ type: 'separator' },
				{ role: 'togglefullscreen', label: 'Vollbild' }
			]
		},
		{
			label: 'Hilfe',
			submenu: [
				{
					label: 'Über CASHFLOX Hub',
					click: () => {
						// Zeige About-Dialog
					}
				}
			]
		}
	];
	
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

// App-Events
app.whenReady().then(() => {
	createWindow();
	createMenu();
	
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// IPC Handlers
ipcMain.on('open-app', (event, appName) => {
	// Öffne App in neuem Fenster
	const appWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	
	const appPaths = {
		kassenbuch: path.join(__dirname, '..', 'Kassenbuch', 'kassenbuch.html'),
		budget: path.join(__dirname, '..', 'budget.html'),
		contract: path.join(__dirname, '..', 'contract.html'),
		flowcashx: path.join(__dirname, '..', 'FLOCASHX.HTML'),
		uae: path.join(__dirname, '..', 'chflox.html')
	};
	
	if (appPaths[appName]) {
		appWindow.loadFile(appPaths[appName]);
	}
});
