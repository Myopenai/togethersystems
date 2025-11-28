/**
 * Amara.org Community Integration
 * IBM XXXL Standard - MCP Enhanced
 * Subtitle and translation services
 * Version: 1.0.0-XXXXXXL
 */

class AmaraIntegration {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.AMARA_API_KEY;
    this.apiBase = 'https://amara.org/api';
    this.team = 'togethersystems';
  }

  async getSubtitles(videoUrl, language = 'en') {
    try {
      const response = await fetch(
        `${this.apiBase}/videos/?video_url=${encodeURIComponent(videoUrl)}&format=json`,
        {
          headers: {
            'X-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Amara API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Amara API error:', error);
      return null;
    }
  }

  async createSubtitleRequest(videoUrl, languages = ['en', 'de', 'fr']) {
    try {
      const response = await fetch(`${this.apiBase}/videos/`, {
        method: 'POST',
        headers: {
          'X-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_url: videoUrl,
          primary_audio_language_code: 'en',
          title: 'Together Systems Portal',
          description: 'Together Systems - Meta-Transaktionsportal',
          team: this.team
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create subtitle request: ${response.status}`);
      }

      const video = await response.json();

      // Request subtitles for multiple languages
      for (const lang of languages) {
        await this.requestSubtitleLanguage(video.id, lang);
      }

      return video;
    } catch (error) {
      console.error('Amara integration error:', error);
      return null;
    }
  }

  async requestSubtitleLanguage(videoId, languageCode) {
    try {
      const response = await fetch(
        `${this.apiBase}/videos/${videoId}/languages/${languageCode}/subtitles/`,
        {
          method: 'POST',
          headers: {
            'X-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subtitles: '',
            action: 'save-draft'
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error(`Failed to request ${languageCode} subtitles:`, error);
      return false;
    }
  }

  async getSubtitleText(videoId, languageCode) {
    try {
      const response = await fetch(
        `${this.apiBase}/videos/${videoId}/languages/${languageCode}/subtitles/?format=json`,
        {
          headers: {
            'X-api-key': this.apiKey
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.subtitles;
    } catch (error) {
      console.error('Failed to get subtitle text:', error);
      return null;
    }
  }

  async embedSubtitles(videoElement, videoUrl, language = 'en') {
    const subtitles = await this.getSubtitles(videoUrl, language);
    if (subtitles && subtitles.meta && subtitles.meta.total_count > 0) {
      const video = subtitles.objects[0];
      const subtitleText = await this.getSubtitleText(video.id, language);
      
      if (subtitleText) {
        // Create track element for subtitles
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = language;
        track.srclang = language;
        track.src = `data:text/vtt;base64,${btoa(subtitleText)}`;
        videoElement.appendChild(track);
      }
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AmaraIntegration;
}
if (typeof window !== 'undefined') {
  window.AmaraIntegration = AmaraIntegration;
}

