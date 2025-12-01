// Developer Onboarding System - Ohne GitHub-Einladung
// Community-Entwickler können sich direkt anbinden

class DeveloperOnboarding {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
  }

  /**
   * Entwickler registrieren
   * @param {object} developerData - Entwickler-Daten
   */
  async registerDeveloper(developerData) {
    const developer = {
      id: `dev-${this.generateId()}`,
      name: developerData.name,
      email: developerData.email || null,
      skills: developerData.skills || [],
      level: developerData.level || 'beginner', // beginner | intermediate | advanced | expert
      digitalNotarVerified: false,
      contributions: [],
      status: 'active',
      joinedAt: new Date().toISOString(),
      identityId: developerData.identityId || null
    };

    const developers = await this.getDevelopers();
    developers.push(developer);
    await this.storage.set('developers', developers);
    
    this.eventBus.emit('DEVELOPER_REGISTERED', { developer });
    return developer;
  }

  /**
   * Digital Notar Verifizierung
   * @param {string} developerId - Entwickler-ID
   * @param {object} notarData - Notar-Daten
   */
  async verifyWithDigitalNotar(developerId, notarData) {
    const developer = await this.getDeveloper(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    // Digital Notar Verifizierung
    developer.digitalNotarVerified = true;
    developer.notarData = {
      verifiedAt: new Date().toISOString(),
      notarId: notarData.notarId,
      certificate: notarData.certificate
    };

    const developers = await this.getDevelopers();
    const index = developers.findIndex(d => d.id === developerId);
    if (index > -1) {
      developers[index] = developer;
      await this.storage.set('developers', developers);
      
      this.eventBus.emit('DEVELOPER_VERIFIED', { developerId, notarData });
    }

    return developer;
  }

  /**
   * Code-Submission einreichen
   * @param {string} developerId - Entwickler-ID
   * @param {object} submission - Submission-Daten
   */
  async submitCode(developerId, submission) {
    const submissionObj = {
      id: `sub-${this.generateId()}`,
      developerId,
      title: submission.title,
      description: submission.description,
      code: submission.code,
      files: submission.files || [],
      category: submission.category || 'feature',
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      approvedAt: null,
      mergedAt: null
    };

    const submissions = await this.getSubmissions();
    submissions.push(submissionObj);
    await this.storage.set('code_submissions', submissions);
    
    // Entwickler-Contribution hinzufügen
    const developer = await this.getDeveloper(developerId);
    if (developer) {
      developer.contributions.push({
        type: 'code_submission',
        submissionId: submissionObj.id,
        submittedAt: submissionObj.submittedAt
      });
      await this.updateDeveloper(developer);
    }

    this.eventBus.emit('CODE_SUBMITTED', { submission: submissionObj });
    return submissionObj;
  }

  /**
   * Entwickler abrufen
   */
  async getDeveloper(developerId) {
    const developers = await this.getDevelopers();
    return developers.find(d => d.id === developerId) || null;
  }

  /**
   * Alle Entwickler abrufen
   */
  async getDevelopers() {
    const developers = await this.storage.get('developers');
    return Array.isArray(developers) ? developers : [];
  }

  /**
   * Submissions abrufen
   */
  async getSubmissions() {
    const submissions = await this.storage.get('code_submissions');
    return Array.isArray(submissions) ? submissions : [];
  }

  /**
   * Entwickler aktualisieren
   */
  async updateDeveloper(developer) {
    const developers = await this.getDevelopers();
    const index = developers.findIndex(d => d.id === developer.id);
    if (index > -1) {
      developers[index] = developer;
      await this.storage.set('developers', developers);
    }
  }

  /**
   * Submission-Status aktualisieren
   * @param {string} submissionId - Submission-ID
   * @param {string} status - Neuer Status
   */
  async updateSubmissionStatus(submissionId, status) {
    const submissions = await this.getSubmissions();
    const submission = submissions.find(s => s.id === submissionId);
    if (submission) {
      submission.status = status;
      if (status === 'approved') {
        submission.approvedAt = new Date().toISOString();
      } else if (status === 'merged') {
        submission.mergedAt = new Date().toISOString();
      }
      await this.storage.set('code_submissions', submissions);
      
      this.eventBus.emit('SUBMISSION_STATUS_UPDATED', { submissionId, status });
    }
  }

  /**
   * ID generieren
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DeveloperOnboarding };
}








