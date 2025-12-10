// [.SYSTEMS.T.SYSTEMS.] KASSENBUCH COMMUNICATION LAYER
// Zentraler Kommunikations-Layer für alle Apps (Budget, Contract, Flowcashx, Indexportal)

(function() {
	'use strict';
	
	console.log('[FABRIKAGE] Kassenbuch Communication Layer geladen');
	
	// ============================================
	// ZENTRALER KOMMUNIKATIONS-HUB
	// ============================================
	
	window.cashflowHub = {
		// Apps registrieren
		apps: {},
		
		// App registrieren
		registerApp: function(appName, module) {
			try {
				this.apps[appName] = module;
				console.log(`[FABRIKAGE] App registriert: ${appName}`);
				
				// Event auslösen
				window.dispatchEvent(new CustomEvent('cashflow:appRegistered', {
					detail: { appName, module }
				}));
			} catch(e) {
				console.error(`[FABRIKAGE] registerApp error for ${appName}:`, e);
			}
		},
		
		// Daten an alle Apps senden
		broadcast: function(sourceApp, data) {
			try {
				Object.keys(this.apps).forEach(appName => {
					if (appName !== sourceApp) {
						try {
							const module = this.apps[appName];
							if (module && typeof module.setFromKassenbuch === 'function') {
								module.setFromKassenbuch(data);
								console.log(`[FABRIKAGE] Broadcast: ${sourceApp} → ${appName}`);
							}
						} catch(e) {
							console.error(`[FABRIKAGE] Broadcast error to ${appName}:`, e);
						}
					}
				});
			} catch(e) {
				console.error('[FABRIKAGE] broadcast error:', e);
			}
		},
		
		// Daten von einer App abrufen
		getAppData: function(appName) {
			try {
				const module = this.apps[appName];
				if (module && typeof module.getData === 'function') {
					return module.getData();
				}
			} catch(e) {
				console.error(`[FABRIKAGE] getAppData error for ${appName}:`, e);
			}
			return null;
		},
		
		// Alle App-Daten abrufen
		getAllData: function() {
			const allData = {};
			Object.keys(this.apps).forEach(appName => {
				allData[appName] = this.getAppData(appName);
			});
			return allData;
		},
		
		// Synchronisation aller Apps
		syncAll: function() {
			try {
				console.log('[FABRIKAGE] Starte Synchronisation aller Apps...');
				
				// Sammle Daten von allen Apps
				const allData = this.getAllData();
				
				// Sende an alle Apps
				Object.keys(allData).forEach(sourceApp => {
					if (allData[sourceApp]) {
						this.broadcast(sourceApp, allData[sourceApp]);
					}
				});
				
				// Sende Kassenbuch-Daten an alle Apps
				if (window.kassenbuchModule && typeof window.kassenbuchModule.getData === 'function') {
					const kassenbuchData = window.kassenbuchModule.getData();
					this.broadcast('kassenbuch', kassenbuchData);
				}
				
				console.log('[FABRIKAGE] Synchronisation abgeschlossen');
			} catch(e) {
				console.error('[FABRIKAGE] syncAll error:', e);
			}
		}
	};
	
	// ============================================
	// AUTO-SYNC (alle 30 Sekunden)
	// ============================================
	
	setInterval(() => {
		if (window.cashflowHub) {
			window.cashflowHub.syncAll();
		}
	}, 30000);
	
	// ============================================
	// STORAGE EVENT LISTENER (Cross-Tab Kommunikation)
	// ============================================
	
	window.addEventListener('storage', (e) => {
		if (e.key && (
			e.key.startsWith('kassenbuch.') ||
			e.key.startsWith('budget.') ||
			e.key.startsWith('contract.') ||
			e.key.startsWith('flowcashx.') ||
			e.key.startsWith('indexortal.')
		)) {
			if (window.cashflowHub) {
				window.cashflowHub.syncAll();
			}
		}
	});
	
	// ============================================
	// CUSTOM EVENT LISTENER
	// ============================================
	
	window.addEventListener('cashflow:dataChanged', (e) => {
		if (window.cashflowHub) {
			window.cashflowHub.syncAll();
		}
	});
	
	console.log('[FABRIKAGE] Kassenbuch Communication Layer initialisiert');
})();

