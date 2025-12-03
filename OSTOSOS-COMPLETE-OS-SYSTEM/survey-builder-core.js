/**
 * T,. OSTOSOS Survey Builder Core
 * Vollständiges Survey/Umfrage System
 * 
 * Features:
 * - Survey Builder
 * - Survey Embedding
 * - Survey Analytics
 * - Survey Integration
 */

class OSTOSOSSurveyBuilder {
  constructor() {
    this.surveys = new Map();
    this.responses = new Map();
    this.surveyIdCounter = 0;
    
    this.loadSurveys();
    this.loadResponses();
    
    console.log('T,. Survey Builder initialisiert');
  }
  
  /**
   * Erstellt eine neue Umfrage
   */
  createSurvey(title, description = '') {
    const surveyId = `survey-${++this.surveyIdCounter}`;
    const survey = {
      id: surveyId,
      title: title,
      description: description,
      questions: [],
      settings: {
        allowMultipleSubmissions: false,
        showProgress: true,
        anonymous: true,
        requiredFields: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.surveys.set(surveyId, survey);
    this.saveSurveys();
    
    console.log(`T,. Umfrage erstellt: ${surveyId}`);
    return surveyId;
  }
  
  /**
   * Fügt eine Frage hinzu
   */
  addQuestion(surveyId, question) {
    const survey = this.surveys.get(surveyId);
    if (!survey) return null;
    
    const questionId = `q-${survey.questions.length + 1}`;
    const fullQuestion = {
      id: questionId,
      type: question.type || 'text', // text, textarea, radio, checkbox, select, rating, scale
      text: question.text || '',
      required: question.required || false,
      options: question.options || [],
      placeholder: question.placeholder || '',
      validation: question.validation || null,
      ...question
    };
    
    survey.questions.push(fullQuestion);
    survey.updatedAt = new Date().toISOString();
    
    this.saveSurveys();
    return questionId;
  }
  
  /**
   * Rendert eine Umfrage
   */
  renderSurvey(surveyId, containerId) {
    const survey = this.surveys.get(surveyId);
    if (!survey) {
      console.error(`Umfrage nicht gefunden: ${surveyId}`);
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container nicht gefunden: ${containerId}`);
      return;
    }
    
    const surveyElement = document.createElement('div');
    surveyElement.className = 'ostosos-survey';
    surveyElement.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      background: var(--davinci-card, #1a1f3a);
      padding: 30px;
      border-radius: 12px;
      border: 2px solid var(--davinci-accent-primary, #10b981);
    `;
    
    // Title
    const title = document.createElement('h2');
    title.textContent = survey.title;
    title.style.cssText = `
      color: var(--davinci-accent-primary, #10b981);
      margin-bottom: 10px;
    `;
    surveyElement.appendChild(title);
    
    // Description
    if (survey.description) {
      const desc = document.createElement('p');
      desc.textContent = survey.description;
      desc.style.cssText = `
        color: var(--davinci-muted, #9ca3af);
        margin-bottom: 30px;
      `;
      surveyElement.appendChild(desc);
    }
    
    // Progress Bar
    if (survey.settings.showProgress) {
      const progressBar = document.createElement('div');
      progressBar.className = 'ostosos-survey-progress';
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: var(--davinci-bg, #0f172a);
        border-radius: 2px;
        margin-bottom: 30px;
      `;
      
      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        width: 0%;
        height: 100%;
        background: var(--davinci-accent-primary, #10b981);
        border-radius: 2px;
        transition: width 0.3s;
      `;
      
      progressBar.appendChild(progressFill);
      surveyElement.appendChild(progressBar);
    }
    
    // Questions
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'ostosos-survey-questions';
    
    survey.questions.forEach((question, index) => {
      const questionElement = this.renderQuestion(question, index, survey.questions.length);
      questionsContainer.appendChild(questionElement);
    });
    
    surveyElement.appendChild(questionsContainer);
    
    // Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Umfrage absenden';
    submitBtn.className = 'ostosos-survey-submit';
    submitBtn.style.cssText = `
      width: 100%;
      padding: 15px;
      background: var(--davinci-accent-primary, #10b981);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 30px;
      transition: all 0.2s;
    `;
    
    submitBtn.addEventListener('mouseenter', () => {
      submitBtn.style.transform = 'translateY(-2px)';
      submitBtn.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.4)';
    });
    
    submitBtn.addEventListener('mouseleave', () => {
      submitBtn.style.transform = 'translateY(0)';
      submitBtn.style.boxShadow = 'none';
    });
    
    submitBtn.addEventListener('click', () => {
      this.submitSurvey(surveyId, surveyElement);
    });
    
    surveyElement.appendChild(submitBtn);
    
    container.appendChild(surveyElement);
    
    // Update progress on input
    if (survey.settings.showProgress) {
      const inputs = surveyElement.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          this.updateProgress(surveyElement);
        });
      });
    }
  }
  
  /**
   * Rendert eine Frage
   */
  renderQuestion(question, index, total) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'ostosos-survey-question';
    questionDiv.style.cssText = `
      margin-bottom: 30px;
    `;
    
    // Question Text
    const questionLabel = document.createElement('label');
    questionLabel.textContent = `${index + 1}. ${question.text}${question.required ? ' *' : ''}`;
    questionLabel.style.cssText = `
      display: block;
      color: var(--davinci-text, #ffffff);
      font-weight: 600;
      margin-bottom: 10px;
    `;
    questionDiv.appendChild(questionLabel);
    
    // Question Input based on type
    let inputElement;
    
    switch (question.type) {
      case 'textarea':
        inputElement = document.createElement('textarea');
        inputElement.rows = 5;
        inputElement.style.cssText = `
          width: 100%;
          padding: 10px;
          border: 1px solid var(--davinci-border, #223040);
          border-radius: 8px;
          background: var(--davinci-bg, #0f172a);
          color: var(--davinci-text, #ffffff);
          resize: vertical;
        `;
        break;
        
      case 'radio':
        question.options.forEach(option => {
          const radioDiv = document.createElement('div');
          radioDiv.style.cssText = 'margin-bottom: 10px;';
          
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = question.id;
          radio.value = option.value || option;
          radio.id = `${question.id}-${option.value || option}`;
          radio.style.marginRight = '8px';
          
          const label = document.createElement('label');
          label.htmlFor = radio.id;
          label.textContent = option.label || option;
          label.style.cssText = 'color: var(--davinci-text, #ffffff); cursor: pointer;';
          
          radioDiv.appendChild(radio);
          radioDiv.appendChild(label);
          questionDiv.appendChild(radioDiv);
        });
        return questionDiv;
        
      case 'checkbox':
        question.options.forEach(option => {
          const checkboxDiv = document.createElement('div');
          checkboxDiv.style.cssText = 'margin-bottom: 10px;';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = option.value || option;
          checkbox.id = `${question.id}-${option.value || option}`;
          checkbox.style.marginRight = '8px';
          
          const label = document.createElement('label');
          label.htmlFor = checkbox.id;
          label.textContent = option.label || option;
          label.style.cssText = 'color: var(--davinci-text, #ffffff); cursor: pointer;';
          
          checkboxDiv.appendChild(checkbox);
          checkboxDiv.appendChild(label);
          questionDiv.appendChild(checkboxDiv);
        });
        return questionDiv;
        
      case 'select':
        inputElement = document.createElement('select');
        question.options.forEach(option => {
          const optionEl = document.createElement('option');
          optionEl.value = option.value || option;
          optionEl.textContent = option.label || option;
          inputElement.appendChild(optionEl);
        });
        break;
        
      case 'rating':
        const ratingDiv = document.createElement('div');
        ratingDiv.style.cssText = 'display: flex; gap: 10px;';
        
        for (let i = 1; i <= (question.maxRating || 5); i++) {
          const star = document.createElement('button');
          star.type = 'button';
          star.textContent = '⭐';
          star.dataset.rating = i;
          star.style.cssText = `
            background: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            transition: transform 0.2s;
          `;
          
          star.addEventListener('mouseenter', () => {
            star.style.transform = 'scale(1.2)';
          });
          
          star.addEventListener('mouseleave', () => {
            star.style.transform = 'scale(1)';
          });
          
          star.addEventListener('click', () => {
            ratingDiv.querySelectorAll('button').forEach((btn, idx) => {
              if (idx < i) {
                btn.textContent = '⭐';
              } else {
                btn.textContent = '☆';
              }
            });
            questionDiv.dataset.rating = i;
          });
          
          ratingDiv.appendChild(star);
        }
        
        questionDiv.appendChild(ratingDiv);
        return questionDiv;
        
      default: // text
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        break;
    }
    
    if (inputElement) {
      inputElement.id = question.id;
      inputElement.name = question.id;
      inputElement.required = question.required;
      inputElement.placeholder = question.placeholder;
      
      if (!inputElement.style.cssText) {
        inputElement.style.cssText = `
          width: 100%;
          padding: 10px;
          border: 1px solid var(--davinci-border, #223040);
          border-radius: 8px;
          background: var(--davinci-bg, #0f172a);
          color: var(--davinci-text, #ffffff);
        `;
      }
      
      questionDiv.appendChild(inputElement);
    }
    
    return questionDiv;
  }
  
  /**
   * Aktualisiert Progress Bar
   */
  updateProgress(surveyElement) {
    const progressFill = surveyElement.querySelector('.ostosos-survey-progress > div');
    if (!progressFill) return;
    
    const inputs = surveyElement.querySelectorAll('input, textarea, select');
    const filled = Array.from(inputs).filter(input => {
      if (input.type === 'radio') {
        return surveyElement.querySelector(`input[name="${input.name}"]:checked`) !== null;
      } else if (input.type === 'checkbox') {
        return input.checked;
      } else {
        return input.value.trim() !== '';
      }
    }).length;
    
    const total = inputs.length;
    const percentage = total > 0 ? (filled / total) * 100 : 0;
    
    progressFill.style.width = `${percentage}%`;
  }
  
  /**
   * Sendet eine Umfrage ab
   */
  submitSurvey(surveyId, surveyElement) {
    const survey = this.surveys.get(surveyId);
    if (!survey) return;
    
    const response = {
      surveyId: surveyId,
      answers: {},
      submittedAt: new Date().toISOString(),
      userId: localStorage.getItem('ostosos.userId') || 'anonymous'
    };
    
    // Collect answers
    survey.questions.forEach(question => {
      let answer;
      
      if (question.type === 'radio') {
        const checked = surveyElement.querySelector(`input[name="${question.id}"]:checked`);
        answer = checked ? checked.value : null;
      } else if (question.type === 'checkbox') {
        const checked = Array.from(surveyElement.querySelectorAll(`input[type="checkbox"][name="${question.id}"]:checked`));
        answer = checked.map(cb => cb.value);
      } else if (question.type === 'rating') {
        answer = surveyElement.querySelector(`[data-question-id="${question.id}"]`)?.dataset.rating || null;
      } else {
        const input = surveyElement.querySelector(`#${question.id}`);
        answer = input ? input.value : null;
      }
      
      // Validation
      if (question.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
        alert(`Bitte beantworten Sie die Frage: ${question.text}`);
        return;
      }
      
      response.answers[question.id] = answer;
    });
    
    // Save response
    if (!this.responses.has(surveyId)) {
      this.responses.set(surveyId, []);
    }
    
    this.responses.get(surveyId).push(response);
    this.saveResponses();
    
    // Show success message
    surveyElement.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2 style="color: var(--davinci-accent-primary, #10b981); margin-bottom: 20px;">✅ Vielen Dank!</h2>
        <p style="color: var(--davinci-text, #ffffff);">Ihre Umfrage wurde erfolgreich abgesendet.</p>
      </div>
    `;
    
    console.log(`T,. Umfrage abgesendet: ${surveyId}`);
  }
  
  /**
   * Erstellt Analytics für eine Umfrage
   */
  getAnalytics(surveyId) {
    const survey = this.surveys.get(surveyId);
    const responses = this.responses.get(surveyId) || [];
    
    if (!survey) return null;
    
    const analytics = {
      surveyId: surveyId,
      totalResponses: responses.length,
      questionStats: {}
    };
    
    survey.questions.forEach(question => {
      const stats = {
        question: question.text,
        type: question.type,
        responses: []
      };
      
      responses.forEach(response => {
        const answer = response.answers[question.id];
        if (answer !== undefined && answer !== null) {
          stats.responses.push(answer);
        }
      });
      
      // Calculate statistics based on type
      if (question.type === 'radio' || question.type === 'select') {
        const counts = {};
        stats.responses.forEach(answer => {
          counts[answer] = (counts[answer] || 0) + 1;
        });
        stats.counts = counts;
      } else if (question.type === 'rating') {
        const ratings = stats.responses.map(r => parseInt(r)).filter(r => !isNaN(r));
        if (ratings.length > 0) {
          stats.average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          stats.min = Math.min(...ratings);
          stats.max = Math.max(...ratings);
        }
      }
      
      analytics.questionStats[question.id] = stats;
    });
    
    return analytics;
  }
  
  /**
   * Speichert Umfragen
   */
  saveSurveys() {
    const surveysArray = Array.from(this.surveys.values());
    localStorage.setItem('ostosos.surveys', JSON.stringify(surveysArray));
  }
  
  /**
   * Lädt Umfragen
   */
  loadSurveys() {
    const saved = localStorage.getItem('ostosos.surveys');
    if (saved) {
      try {
        const surveysArray = JSON.parse(saved);
        surveysArray.forEach(survey => {
          this.surveys.set(survey.id, survey);
        });
      } catch (e) {
        console.error('Fehler beim Laden der Umfragen:', e);
      }
    }
  }
  
  /**
   * Speichert Antworten
   */
  saveResponses() {
    const responsesObj = {};
    this.responses.forEach((responses, surveyId) => {
      responsesObj[surveyId] = responses;
    });
    localStorage.setItem('ostosos.survey.responses', JSON.stringify(responsesObj));
  }
  
  /**
   * Lädt Antworten
   */
  loadResponses() {
    const saved = localStorage.getItem('ostosos.survey.responses');
    if (saved) {
      try {
        const responsesObj = JSON.parse(saved);
        Object.keys(responsesObj).forEach(surveyId => {
          this.responses.set(surveyId, responsesObj[surveyId]);
        });
      } catch (e) {
        console.error('Fehler beim Laden der Antworten:', e);
      }
    }
  }
}

// Global verfügbar machen
window.OSTOSOSSurveyBuilder = OSTOSOSSurveyBuilder;
window.OSTOSOSSurveys = window.OSTOSOSSurveys || new OSTOSOSSurveyBuilder();

console.log('T,. Survey Builder Core geladen');

