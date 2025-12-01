// Erweiterte Backup/Restore-Logik für Together Systems Manifest
// Verhindert Datenverlust bei Neuinstallation/Deployment

const TS_LOCAL_DB_KEY = 'manifest.db';
const TS_LOCAL_DB_UPDATED_KEY = 'manifest.db.updated';
const TS_RECOVERY_FLAG_KEY = 'ts.recovery.lastInstalledAt';
const TS_BACKUP_WARNING_KEY = 'ts.backup.lastWarningAt';

// 1) Offline-DB laden/speichern
export function loadLocalDB() {
  try {
    const raw = localStorage.getItem(TS_LOCAL_DB_KEY);
    return raw ? JSON.parse(raw) : { posts: [], settings: {} };
  } catch (e) {
    console.error('Failed to parse local DB:', e);
    return { posts: [], settings: {} };
  }
}

export function saveLocalDB(db) {
  try {
    localStorage.setItem(TS_LOCAL_DB_KEY, JSON.stringify(db));
    localStorage.setItem(TS_LOCAL_DB_UPDATED_KEY, new Date().toISOString());
    return true;
  } catch (e) {
    console.error('Failed to save local DB:', e);
    return false;
  }
}

// 2) Export-Funktion (JSON-Download)
export function exportLocalDB() {
  const db = loadLocalDB();
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    system: 'togethersystems-manifest',
    data: db,
    metadata: {
      postsCount: db.posts?.length || 0,
      settings: db.settings || {},
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `togethersystems-manifest-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Warnung zurücksetzen
  localStorage.removeItem(TS_BACKUP_WARNING_KEY);
  
  return true;
}

// 3) Import-Funktion (JSON-Upload)
export function importLocalDBFromFile(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = event.target.result;
      const payload = JSON.parse(text);

      if (!payload || !payload.data) {
        throw new Error('Ungültiges Backup-Format: data-Feld fehlt');
      }

      // Validierung
      if (!Array.isArray(payload.data.posts)) {
        throw new Error('Ungültiges Backup-Format: posts muss ein Array sein');
      }

      // Sicherheitskopie vor Import
      const currentDB = loadLocalDB();
      const backup = {
        version: 2,
        backedUpAt: new Date().toISOString(),
        data: currentDB,
      };
      localStorage.setItem('manifest.db.pre-import-backup', JSON.stringify(backup));

      // Import
      saveLocalDB(payload.data);

      if (typeof onSuccess === 'function') {
        onSuccess(payload);
      }
    } catch (err) {
      console.error('Import failed:', err);
      if (typeof onError === 'function') {
        onError(err);
      }
    }
  };
  reader.readAsText(file, 'utf-8');
}

// 4) "Fresh Install" / Recovery-Detection
export function isFreshInstall() {
  const dbRaw = localStorage.getItem(TS_LOCAL_DB_KEY);
  const flag = localStorage.getItem(TS_RECOVERY_FLAG_KEY);
  return !dbRaw && !flag;
}

export function markInstalled() {
  localStorage.setItem(TS_RECOVERY_FLAG_KEY, new Date().toISOString());
}

// 5) Backup-Warnung (alle 12 Stunden)
export function checkBackupWarning() {
  const lastWarning = localStorage.getItem(TS_BACKUP_WARNING_KEY);
  const lastUpdated = localStorage.getItem(TS_LOCAL_DB_UPDATED_KEY);
  
  if (!lastUpdated) return false; // Noch keine Daten

  const lastWarningTime = lastWarning ? new Date(lastWarning).getTime() : 0;
  const lastUpdatedTime = new Date(lastUpdated).getTime();
  const now = Date.now();

  // Prüfe ob mehr als 12 Stunden seit letztem Update
  const hoursSinceUpdate = (now - lastUpdatedTime) / (1000 * 60 * 60);
  const hoursSinceWarning = (now - lastWarningTime) / (1000 * 60 * 60);

  if (hoursSinceUpdate > 12 && hoursSinceWarning > 12) {
    localStorage.setItem(TS_BACKUP_WARNING_KEY, new Date().toISOString());
    return true; // Warnung anzeigen
  }

  return false;
}

// 6) Auto-Backup (täglich)
export function autoBackupEnabled() {
  return localStorage.getItem('ts.autoBackup.enabled') === 'true';
}

export function enableAutoBackup() {
  localStorage.setItem('ts.autoBackup.enabled', 'true');
  localStorage.setItem('ts.autoBackup.lastRun', new Date().toISOString());
}

export function disableAutoBackup() {
  localStorage.removeItem('ts.autoBackup.enabled');
}

// 7) UI-Integration: Recovery-Overlay initialisieren
export function initRecoveryUI() {
  const recoveryOverlay = document.getElementById('ts-recovery-overlay');
  const recoveryClose = document.getElementById('ts-recovery-close');
  const recoveryFileInput = document.getElementById('ts-recovery-file');
  const recoveryImportBtn = document.getElementById('ts-recovery-import');
  const exportBtn = document.getElementById('ts-backup-export');
  const backupWarning = document.getElementById('ts-backup-warning');

  // Export-Button
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportLocalDB();
      if (backupWarning) backupWarning.style.display = 'none';
      alert('Backup erfolgreich erstellt!');
    });
  }

  // Recovery-Overlay nur zeigen, wenn "fresh install"
  if (recoveryOverlay && isFreshInstall()) {
    recoveryOverlay.style.display = 'flex';
  }

  if (recoveryClose && recoveryOverlay) {
    recoveryClose.addEventListener('click', () => {
      recoveryOverlay.style.display = 'none';
      markInstalled();
    });
  }

  if (recoveryImportBtn && recoveryFileInput && recoveryOverlay) {
    recoveryImportBtn.addEventListener('click', () => {
      const file = recoveryFileInput.files && recoveryFileInput.files[0];
      if (!file) {
        alert('Bitte zuerst eine Backup-Datei auswählen.');
        return;
      }

      importLocalDBFromFile(
        file,
        () => {
          alert('Backup erfolgreich wiederhergestellt. Seite wird neu geladen.');
          markInstalled();
          setTimeout(() => location.reload(), 500);
        },
        (err) => {
          alert('Fehler beim Import: ' + err.message);
        }
      );
    });
  }

  // Backup-Warnung prüfen
  if (backupWarning && checkBackupWarning()) {
    backupWarning.style.display = 'block';
    const warningClose = document.getElementById('ts-backup-warning-close');
    if (warningClose) {
      warningClose.addEventListener('click', () => {
        backupWarning.style.display = 'none';
      });
    }
  }
}

// Auto-Init
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initRecoveryUI();
    } catch (e) {
      console.error('Failed to initialize recovery UI:', e);
    }
  });
}

// Export für globale Nutzung
if (typeof window !== 'undefined') {
  window.TSBackupRestore = {
    loadLocalDB,
    saveLocalDB,
    exportLocalDB,
    importLocalDBFromFile,
    isFreshInstall,
    markInstalled,
    checkBackupWarning,
    enableAutoBackup,
    disableAutoBackup,
    autoBackupEnabled,
  };
}









