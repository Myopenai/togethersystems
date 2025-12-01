/**
 * Settings Dashboard App
 * 
 * Haupt-Logik für das Settings Dashboard
 */

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Deaktiviere alle Tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    
    // Aktiviere gewählten Tab
    btn.classList.add('active');
    document.getElementById(`${tabName}-panel`).classList.add('active');
  });
});

// Lade Configs
async function loadConfigs() {
  try {
    // Lade MCP Config
    const mcpConfig = await fetch('../config/mcp-config.json')
      .then(r => r.json())
      .catch(() => ({}));
    document.getElementById('mcpConfig').value = JSON.stringify(mcpConfig, null, 2);

    // Lade Playwright Config
    const playwrightConfig = await fetch('../config/playwright-config.json')
      .then(r => r.json())
      .catch(() => ({}));
    document.getElementById('playwrightConfig').value = JSON.stringify(playwrightConfig, null, 2);

    // Lade AutoFix Config
    const autofixConfig = await fetch('../config/autofix-config.json')
      .then(r => r.json())
      .catch(() => ({}));
    document.getElementById('autofixConfig').value = JSON.stringify(autofixConfig, null, 2);
    
    // Zeige Patterns
    if (autofixConfig.patterns) {
      displayAutofixPatterns(autofixConfig.patterns);
    }

    // Lade Deployment Config
    const deploymentConfig = await fetch('../config/deployment-config.json')
      .then(r => r.json())
      .catch(() => ({}));
    document.getElementById('deploymentConfig').value = JSON.stringify(deploymentConfig, null, 2);

    // Lade Neural Network Config
    const neuralConfig = await fetch('../config/neural-network-config.json')
      .then(r => r.json())
      .catch(() => ({}));
    document.getElementById('neuralConfig').value = JSON.stringify(neuralConfig, null, 2);

    // Lade Encryption Config
    const encryptionConfig = await fetch('../config/encryption-config.json')
      .then(r => r.json())
      .catch(() => ({}));
    document.getElementById('encryptionConfig').value = JSON.stringify(encryptionConfig, null, 2);

    // Lade Hosting Providers
    await loadHostingProviders();

    // Lade Integrations
    await loadIntegrations();

    // Lade Employees
    await loadEmployees();

    // Update Stats
    updateStats();
  } catch (error) {
    console.error('Error loading configs:', error);
  }
}

// Zeige AutoFix Patterns
function displayAutofixPatterns(patterns) {
  const container = document.getElementById('autofixPatterns');
  container.innerHTML = patterns.map(pattern => `
    <div class="pattern-card">
      <h5>${pattern.id}</h5>
      <p><strong>Type:</strong> ${pattern.type}</p>
      <p><strong>Fix:</strong> ${pattern.fix}</p>
      <p><strong>Message:</strong> ${pattern.message}</p>
      <span class="severity ${pattern.severity}">${pattern.severity.toUpperCase()}</span>
    </div>
  `).join('');
}

// Lade Hosting Providers
async function loadHostingProviders() {
  try {
    const providers = await fetch('../database/hosting-providers.json')
      .then(r => r.json())
      .then(data => data.providers || [])
      .catch(() => []);

    const container = document.getElementById('hostingComparison');
    container.innerHTML = providers.map(provider => `
      <div class="hosting-card">
        <h4>${provider.name}</h4>
        <p class="price">$${provider.pricing?.free?.price || 0}/mo (Free)</p>
        <p><strong>Category:</strong> ${provider.category.join(', ')}</p>
        <p><strong>Features:</strong> ${provider.features.slice(0, 3).join(', ')}...</p>
        <p><strong>Rating:</strong> ${'⭐'.repeat(provider.rating || 0)}</p>
        ${provider.recommended ? '<span style="color: var(--success);">✓ Recommended</span>' : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading hosting providers:', error);
  }
}

// Lade Integrations
async function loadIntegrations() {
  try {
    const integrations = await fetch('../database/integrations.json')
      .then(r => r.json())
      .then(data => data.integrations || [])
      .catch(() => []);

    const container = document.getElementById('integrationsList');
    container.innerHTML = integrations.map(integration => `
      <div class="integration-card">
        <h4>${integration.name}</h4>
        <p><strong>Type:</strong> ${integration.type}</p>
        <p><strong>Status:</strong> <span style="color: var(--success);">${integration.status}</span></p>
        <p>${integration.description}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading integrations:', error);
  }
}

// Lade Employees
async function loadEmployees() {
  try {
    const employees = await fetch('../database/employees.json')
      .then(r => r.json())
      .then(data => data.employees || [])
      .catch(() => []);

    const container = document.getElementById('employeesList');
    if (employees.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted);">Noch keine Mitarbeiter registriert.</p>';
    } else {
      container.innerHTML = employees.map(emp => `
        <div class="employee-card">
          <h4>${emp.displayName}</h4>
          <p><strong>Role:</strong> ${emp.role}</p>
          <p><strong>Email:</strong> ${emp.email}</p>
          <p><strong>Status:</strong> <span style="color: var(--success);">${emp.status}</span></p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading employees:', error);
  }
}

// Update Stats
function updateStats() {
  // Diese Werte würden normalerweise aus den geladenen Daten kommen
  document.getElementById('totalServices').textContent = '6';
  document.getElementById('totalIntegrations').textContent = '6';
  document.getElementById('totalEmployees').textContent = '0';
  document.getElementById('totalHostingProviders').textContent = '9';
}

// Employee Form
document.getElementById('employeeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const employeeData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    role: document.getElementById('role').value
  };

  // In Produktion: API-Call zum Backend
  console.log('Registering employee:', employeeData);
  alert('Mitarbeiter registriert! (In Produktion würde dies an das Backend gesendet)');
  
  // Formular zurücksetzen
  e.target.reset();
  
  // Employees neu laden
  await loadEmployees();
  updateStats();
});

// Export/Import
document.getElementById('exportBtn')?.addEventListener('click', () => {
  alert('Export-Funktion würde alle Settings als JSON exportieren');
});

document.getElementById('importBtn')?.addEventListener('click', () => {
  alert('Import-Funktion würde Settings aus JSON importieren');
});

document.getElementById('refreshBtn')?.addEventListener('click', () => {
  loadConfigs();
});

// Config Editor
window.editConfig = function(configType) {
  const textarea = document.getElementById(`${configType}Config`);
  if (textarea.readOnly) {
    textarea.readOnly = false;
    textarea.style.borderColor = 'var(--primary)';
  } else {
    textarea.readOnly = true;
    textarea.style.borderColor = 'var(--border)';
    // In Produktion: Speichere Config
    alert(`Config ${configType} würde gespeichert werden`);
  }
};

// Initial Load
loadConfigs();








