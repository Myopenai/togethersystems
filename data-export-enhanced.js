// Daten-Export & Portabilität - Erweiterte Export-Funktionen
// ZIP-Export mit Media-Dateien, vollständiger Daten-Export

// Erweiterte Export-Funktion: JSON + ZIP mit Media
async function exportAllData(format = 'json') {
  const db = loadDB();
  const userId = getOrCreateUserId();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  if (format === 'json') {
    // Einfacher JSON-Export (bestehend)
    const jsonData = JSON.stringify(db, null, 2);
    download(`manifest-export-${timestamp}.json`, jsonData);
    return;
  }
  
  if (format === 'zip') {
    // ZIP-Export mit Media-Dateien
    try {
      // JSZip Bibliothek wird benötigt - wir verwenden eine einfache Lösung ohne externe Lib
      // Für vollständigen ZIP-Export würde man JSZip benötigen
      alert('ZIP-Export benötigt JSZip-Bibliothek. JSON-Export steht zur Verfügung.');
      return;
    } catch (err) {
      console.error('ZIP-Export Fehler:', err);
      alert('ZIP-Export fehlgeschlagen. Verwende JSON-Export.');
      exportAllData('json');
    }
  }
}

// Vollständiger Daten-Export (inkl. LocalStorage-Daten)
function exportCompleteData() {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: getOrCreateUserId(),
    manifest: loadDB(),
    settings: {
      userPreferences: localStorage.getItem('userPreferences') ? JSON.parse(localStorage.getItem('userPreferences')) : {},
      verified: localStorage.getItem('mot_verified_v1') ? JSON.parse(localStorage.getItem('mot_verified_v1')) : null,
    },
    backups: getBackupList(),
  };
  
  const jsonData = JSON.stringify(exportData, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  download(`togethersystems-complete-export-${timestamp}.json`, jsonData);
}

// Backup-Liste aus LocalStorage
function getBackupList() {
  const backups = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ts_backup_')) {
        try {
          backups.push({
            key,
            timestamp: key.split('_').pop(),
            data: JSON.parse(localStorage.getItem(key)),
          });
        } catch (e) {
          // Ignore invalid backups
        }
      }
    }
  } catch (e) {
    console.error('Backup-Liste Fehler:', e);
  }
  return backups;
}

// Media-Dateien aus Posts extrahieren
function extractMediaFiles() {
  const db = loadDB();
  const mediaFiles = [];
  
  db.posts.forEach(post => {
    if (post.media && Array.isArray(post.media)) {
      post.media.forEach(media => {
        if (media.url && media.url.startsWith('data:')) {
          mediaFiles.push({
            postId: post.id,
            url: media.url,
            type: media.type,
            name: media.name,
            mimeType: media.mimeType,
          });
        }
      });
    }
  });
  
  return mediaFiles;
}

// Export-Optionen
function showExportOptions() {
  const options = [
    { label: 'JSON Export (Standard)', value: 'json' },
    { label: 'Vollständiger Export (Alle Daten)', value: 'complete' },
    { label: 'Nur Posts Export', value: 'posts' },
    { label: 'Backup Export', value: 'backup' },
  ];
  
  const choice = prompt(
    'Wähle Export-Format:\n' +
    options.map((o, i) => `${i + 1}. ${o.label}`).join('\n') +
    '\n\nNummer eingeben (1-4):'
  );
  
  const index = parseInt(choice) - 1;
  if (index >= 0 && index < options.length) {
    const format = options[index].value;
    
    if (format === 'json') {
      exportAllData('json');
    } else if (format === 'complete') {
      exportCompleteData();
    } else if (format === 'posts') {
      const db = loadDB();
      const postsData = { posts: db.posts };
      const jsonData = JSON.stringify(postsData, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      download(`manifest-posts-${timestamp}.json`, jsonData);
    } else if (format === 'backup') {
      const backups = getBackupList();
      const jsonData = JSON.stringify({ backups }, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      download(`manifest-backups-${timestamp}.json`, jsonData);
    }
  }
}

// Import-Funktion erweitern
async function importCompleteData(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (data.manifest && data.manifest.posts) {
      // Import Manifest-Daten
      const db = loadDB();
      db.posts = [...(data.manifest.posts || []), ...db.posts];
      saveDB(db);
      
      // Import Settings (optional)
      if (data.settings) {
        if (data.settings.userPreferences) {
          localStorage.setItem('userPreferences', JSON.stringify(data.settings.userPreferences));
        }
      }
      
      render();
      alert(`✅ Import erfolgreich! ${data.manifest.posts?.length || 0} Posts importiert.`);
    } else if (data.posts) {
      // Einfacher Posts-Import
      const db = loadDB();
      db.posts = [...(data.posts || []), ...db.posts];
      saveDB(db);
      render();
      alert(`✅ Import erfolgreich! ${data.posts.length || 0} Posts importiert.`);
    } else {
      alert('❌ Ungültiges Format. Erwarte Manifest-Daten.');
    }
  } catch (err) {
    console.error('Import-Fehler:', err);
    alert(`❌ Import fehlgeschlagen: ${err.message}`);
  }
}

// Helper-Funktionen (müssen verfügbar sein)
function loadDB() {
  // Muss aus manifest-forum.html verfügbar sein
  if (typeof window.loadDB === 'function') return window.loadDB();
  try {
    const raw = localStorage.getItem('manifest.db') || '{"posts":[]}';
    return JSON.parse(raw);
  } catch {
    return { posts: [] };
  }
}

function saveDB(db) {
  // Muss aus manifest-forum.html verfügbar sein
  if (typeof window.saveDB === 'function') {
    window.saveDB(db);
    return;
  }
  try {
    localStorage.setItem('manifest.db', JSON.stringify(db));
  } catch (e) {
    console.error('Speichern fehlgeschlagen:', e);
  }
}

function getOrCreateUserId() {
  if (typeof window.getOrCreateUserId === 'function') return window.getOrCreateUserId();
  try {
    let uid = localStorage.getItem('mot_user_id_v1');
    if (!uid) {
      uid = 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('mot_user_id_v1', uid);
    }
    return uid;
  } catch {
    return 'unknown-user';
  }
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Export für globale Nutzung
if (typeof window !== 'undefined') {
  window.DataExport = {
    exportAllData,
    exportCompleteData,
    showExportOptions,
    importCompleteData,
    extractMediaFiles,
    getBackupList,
  };
}









