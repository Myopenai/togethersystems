// Backup & Restore System für TogetherSystems
// Automatische Backups und Wiederherstellung

(function(){
  'use strict';

  const BACKUP_PREFIX = 'ts_backup_';
  const BACKUP_KEY_PREFIX = 'ts_backups_';
  const MAX_BACKUPS = 10; // Maximum number of backups to keep

  // Get all localStorage keys that belong to TogetherSystems
  function getAllLocalStorageData() {
    const data = {};
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('portal.') || 
          key.startsWith('mot_') || 
          key.startsWith('ts_') ||
          key.includes('together') ||
          key.includes('manifest')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    });
    return data;
  }

  // Save all localStorage data to localStorage
  function saveAllLocalStorageData(data) {
    Object.entries(data).forEach(([key, value]) => {
      try {
        if (typeof value === 'object') {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, value);
        }
      } catch (err) {
        console.warn(`Could not restore key ${key}:`, err);
      }
    });
  }

  // Create a backup
  window.createTSBackup = function(manual = false) {
    try {
      const timestamp = new Date().toISOString();
      const backupId = `${BACKUP_PREFIX}${Date.now()}`;
      
      const backup = {
        id: backupId,
        timestamp,
        manual,
        version: '1.0.0',
        data: getAllLocalStorageData(),
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          screenSize: `${window.screen.width}x${window.screen.height}`,
        },
      };

      // Save backup to localStorage
      const backupsList = JSON.parse(localStorage.getItem(BACKUP_KEY_PREFIX + 'list') || '[]');
      backupsList.push({
        id: backupId,
        timestamp,
        manual,
      });

      // Keep only last MAX_BACKUPS
      if (backupsList.length > MAX_BACKUPS) {
        const toRemove = backupsList.slice(0, backupsList.length - MAX_BACKUPS);
        toRemove.forEach(b => {
          localStorage.removeItem(b.id);
        });
        backupsList.splice(0, backupsList.length - MAX_BACKUPS);
      }

      localStorage.setItem(backupId, JSON.stringify(backup));
      localStorage.setItem(BACKUP_KEY_PREFIX + 'list', JSON.stringify(backupsList));

      // Also create downloadable backup file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `together-systems-backup-${timestamp.replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        success: true,
        backupId,
        timestamp,
        message: 'Backup erfolgreich erstellt',
      };
    } catch (err) {
      console.error('Backup-Fehler:', err);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  // List all backups
  window.listTSBackups = function() {
    try {
      const backupsList = JSON.parse(localStorage.getItem(BACKUP_KEY_PREFIX + 'list') || '[]');
      return backupsList.map(b => {
        const backupData = localStorage.getItem(b.id);
        if (backupData) {
          try {
            const parsed = JSON.parse(backupData);
            return {
              id: b.id,
              timestamp: b.timestamp,
              manual: b.manual,
              size: backupData.length,
              itemCount: Object.keys(parsed.data || {}).length,
            };
          } catch {
            return null;
          }
        }
        return null;
      }).filter(Boolean).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (err) {
      console.error('Fehler beim Auflisten der Backups:', err);
      return [];
    }
  };

  // Restore from backup
  window.restoreTSBackup = function(backupId) {
    try {
      const backupData = localStorage.getItem(backupId);
      if (!backupData) {
        return {
          success: false,
          error: 'Backup nicht gefunden',
        };
      }

      const backup = JSON.parse(backupData);
      if (!backup.data) {
        return {
          success: false,
          error: 'Ungültiges Backup-Format',
        };
      }

      // Create safety backup before restore
      const safetyBackup = createTSBackup(false);
      if (!safetyBackup.success) {
        return {
          success: false,
          error: 'Sicherheits-Backup konnte nicht erstellt werden',
        };
      }

      // Restore data
      saveAllLocalStorageData(backup.data);

      return {
        success: true,
        backupId,
        safetyBackupId: safetyBackup.backupId,
        message: 'Backup erfolgreich wiederhergestellt',
      };
    } catch (err) {
      console.error('Wiederherstellungs-Fehler:', err);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  // Restore from file
  window.restoreTSBackupFromFile = function(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const backup = JSON.parse(e.target.result);
          if (!backup.data) {
            reject(new Error('Ungültiges Backup-Format'));
            return;
          }

          // Create safety backup
          const safetyBackup = createTSBackup(false);
          if (!safetyBackup.success) {
            reject(new Error('Sicherheits-Backup konnte nicht erstellt werden'));
            return;
          }

          // Restore data
          saveAllLocalStorageData(backup.data);

          resolve({
            success: true,
            backupId: backup.id || 'imported',
            timestamp: backup.timestamp,
            safetyBackupId: safetyBackup.backupId,
            message: 'Backup erfolgreich aus Datei wiederhergestellt',
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
      reader.readAsText(file);
    });
  };

  // Auto-backup every 24 hours
  function setupAutoBackup() {
    const lastBackupKey = BACKUP_KEY_PREFIX + 'last_auto';
    const lastBackupTime = localStorage.getItem(lastBackupKey);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastBackupTime || (now - parseInt(lastBackupTime, 10)) > oneDay) {
      createTSBackup(false);
      localStorage.setItem(lastBackupKey, String(now));
    }
  }

  // Initialize auto-backup on load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', setupAutoBackup);
    
    // Also backup before page unload (if data changed)
    let dataChanged = false;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('portal.') || key.startsWith('mot_') || key.startsWith('ts_')) {
        dataChanged = true;
      }
      return originalSetItem.call(this, key, value);
    };

    window.addEventListener('beforeunload', () => {
      if (dataChanged) {
        // Use sendBeacon for reliable backup on unload
        try {
          const backup = createTSBackup(false);
          if (backup.success) {
            navigator.sendBeacon('/api/admin/backup/log', JSON.stringify({
              backupId: backup.backupId,
              timestamp: backup.timestamp,
            }));
          }
        } catch (err) {
          console.warn('Auto-backup vor unload fehlgeschlagen:', err);
        }
      }
    });
  }

  // Export functions
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createTSBackup,
      listTSBackups,
      restoreTSBackup,
      restoreTSBackupFromFile,
    };
  }
})();

