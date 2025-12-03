// Rich-Media Posts - Erweiterung für Bilder/Videos/Audio in Posts
// Wird in manifest-forum.html integriert

// Media-Upload-Handler
function initRichMediaUpload() {
  const mediaInput = document.getElementById('mediaUpload');
  if (!mediaInput) return;

  mediaInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const mediaPreview = document.getElementById('mediaPreview');
    if (!mediaPreview) return;

    mediaPreview.innerHTML = '';
    const uploadedMedia = [];

    for (const file of files) {
      // Größen-Limits
      const maxSize = {
        image: 5 * 1024 * 1024, // 5MB
        video: 50 * 1024 * 1024, // 50MB
        audio: 10 * 1024 * 1024, // 10MB
      };

      const fileType = file.type.split('/')[0]; // 'image', 'video', 'audio'
      const maxSizeForType = maxSize[fileType] || 2 * 1024 * 1024;

      if (file.size > maxSizeForType) {
        alert(`Datei zu groß: ${file.name}. Maximal ${Math.round(maxSizeForType / 1024 / 1024)}MB für ${fileType}.`);
        continue;
      }

      // Konvertiere zu Data URL (für Offline-Speicherung)
      const dataUrl = await fileToDataURL(file);
      
      uploadedMedia.push({
        dataUrl,
        type: fileType,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });

      // Vorschau erstellen
      const previewItem = document.createElement('div');
      previewItem.style.cssText = 'position:relative;display:inline-block;margin:4px;border:1px solid var(--border);border-radius:8px;overflow:hidden;';
      
      if (fileType === 'image') {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = 'max-width:200px;max-height:200px;display:block;';
        previewItem.appendChild(img);
      } else if (fileType === 'video') {
        const video = document.createElement('video');
        video.src = dataUrl;
        video.controls = true;
        video.style.cssText = 'max-width:200px;max-height:200px;display:block;';
        previewItem.appendChild(video);
      } else if (fileType === 'audio') {
        const audio = document.createElement('audio');
        audio.src = dataUrl;
        audio.controls = true;
        audio.style.cssText = 'width:200px;display:block;';
        previewItem.appendChild(audio);
        const label = document.createElement('div');
        label.textContent = file.name;
        label.style.cssText = 'padding:4px;font-size:12px;';
        previewItem.appendChild(label);
      }

      // Entfernen-Button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.style.cssText = 'position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;';
      removeBtn.onclick = () => {
        previewItem.remove();
        const index = uploadedMedia.findIndex(m => m.dataUrl === dataUrl);
        if (index > -1) uploadedMedia.splice(index, 1);
        updateMediaInput(uploadedMedia);
      };
      previewItem.appendChild(removeBtn);

      mediaPreview.appendChild(previewItem);
    }

    // Speichere in einem versteckten Input für später
    updateMediaInput(uploadedMedia);
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateMediaInput(mediaArray) {
  // Speichere in einem versteckten Element
  let mediaStorage = document.getElementById('uploadedMediaStorage');
  if (!mediaStorage) {
    mediaStorage = document.createElement('input');
    mediaStorage.type = 'hidden';
    mediaStorage.id = 'uploadedMediaStorage';
    document.body.appendChild(mediaStorage);
  }
  mediaStorage.dataset.media = JSON.stringify(mediaArray);
}

function getUploadedMedia() {
  const storage = document.getElementById('uploadedMediaStorage');
  if (!storage || !storage.dataset.media) return [];
  try {
    return JSON.parse(storage.dataset.media);
  } catch {
    return [];
  }
}

// Erweitere Post-Struktur um Media
function addMediaToPost(postData) {
  const media = getUploadedMedia();
  if (media.length === 0) return postData;

  postData.media = media.map(m => ({
    url: m.dataUrl,
    type: m.type,
    name: m.name,
    mimeType: m.mimeType,
  }));

  return postData;
}

// Erweitere Render-Funktion um Media-Anzeige
function renderMediaInPost(post) {
  if (!post.media || !post.media.length) return '';

  return post.media.map(m => {
    if (m.type === 'image') {
      return `<img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.name || '')}" style="max-width:100%;border-radius:8px;margin:8px 0;cursor:pointer;" onclick="window.open('${escapeHtml(m.url)}', '_blank')">`;
    } else if (m.type === 'video') {
      return `<video src="${escapeHtml(m.url)}" controls style="max-width:100%;border-radius:8px;margin:8px 0;"></video>`;
    } else if (m.type === 'audio') {
      return `<audio src="${escapeHtml(m.url)}" controls style="width:100%;margin:8px 0;"></audio><div style="font-size:12px;color:var(--muted);margin-bottom:8px;">${escapeHtml(m.name || 'Audio')}</div>`;
    }
    return '';
  }).join('');
}

function escapeHtml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Export für globale Nutzung
if (typeof window !== 'undefined') {
  window.RichMediaPosts = {
    initRichMediaUpload,
    addMediaToPost,
    renderMediaInPost,
    getUploadedMedia,
    updateMediaInput,
  };
}

// Auto-Init wenn DOM bereit
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRichMediaUpload);
} else {
  initRichMediaUpload();
}









