// Complete Generator - Generiert alles: Code, UI, Tests, Deployment
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const { promptToProgram } = require('./prompt_to_program');
const { emitMobile } = require('./ui_synth/mobile');
const { emitDesktop } = require('./ui_synth/desktop');
const { generateDocker } = require('./deployer/docker');
const { generateK8s } = require('./deployer/k8s');
const { generatePropertyTests } = require('./testsynth/property');
const fs = require('fs');
const path = require('path');

function generateComplete(promptText, outputDir = './generated-complete') {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  COMPLETE PROGRAM GENERATOR');
  console.log('  Version: 3.0.0');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📝 Prompt: ${promptText}`);
  console.log(`📁 Output: ${outputDir}`);
  console.log('');

  // 1. Generate Main Program
  const result = promptToProgram(promptText, outputDir);

  console.log('✅ Programm generiert!');
  console.log(`   Kategorie: ${result.metadata.category}`);
  console.log(`   Domains: ${result.metadata.domains.join(', ')}`);
  console.log(`   Targets: ${result.metadata.targets.join(', ')}`);
  console.log('');

  // 2. Generate Mobile UI (wenn Mobile Target)
  if (result.intent.targets.includes('mobile')) {
    console.log('📱 Generiere Mobile UI...');
    try {
      const mobileRN = emitMobile(result.plan, result.intent, 'react-native');
      const mobileFlutter = emitMobile(result.plan, result.intent, 'flutter');
      
      const mobileDir = path.join(outputDir, 'mobile');
      if (!fs.existsSync(mobileDir)) fs.mkdirSync(mobileDir, { recursive: true });
      
      const rnDir = path.join(mobileDir, 'react-native');
      const flutterDir = path.join(mobileDir, 'flutter');
      
      if (!fs.existsSync(rnDir)) fs.mkdirSync(rnDir, { recursive: true });
      if (!fs.existsSync(flutterDir)) fs.mkdirSync(flutterDir, { recursive: true });
      
      mobileRN.files.forEach(file => {
        fs.writeFileSync(path.join(rnDir, file.path), file.content, 'utf8');
      });
      
      mobileFlutter.files.forEach(file => {
        const filePath = path.join(flutterDir, file.path);
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
        fs.writeFileSync(filePath, file.content, 'utf8');
      });
      
      console.log(`   ✅ React Native: ${rnDir}`);
      console.log(`   ✅ Flutter: ${flutterDir}`);
    } catch (e) {
      console.error(`   ❌ Mobile UI Fehler: ${e.message}`);
    }
  }

  // 3. Generate Desktop UI (wenn Desktop Target)
  if (result.intent.targets.includes('desktop')) {
    console.log('🖥️ Generiere Desktop UI...');
    try {
      const desktopElectron = emitDesktop(result.plan, result.intent, 'electron');
      const desktopTauri = emitDesktop(result.plan, result.intent, 'tauri');
      
      const desktopDir = path.join(outputDir, 'desktop');
      if (!fs.existsSync(desktopDir)) fs.mkdirSync(desktopDir, { recursive: true });
      
      const electronDir = path.join(desktopDir, 'electron');
      const tauriDir = path.join(desktopDir, 'tauri');
      
      if (!fs.existsSync(electronDir)) fs.mkdirSync(electronDir, { recursive: true });
      if (!fs.existsSync(tauriDir)) fs.mkdirSync(tauriDir, { recursive: true });
      
      desktopElectron.files.forEach(file => {
        fs.writeFileSync(path.join(electronDir, file.path), file.content, 'utf8');
      });
      
      desktopTauri.files.forEach(file => {
        const filePath = path.join(tauriDir, file.path);
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
        fs.writeFileSync(filePath, file.content, 'utf8');
      });
      
      console.log(`   ✅ Electron: ${electronDir}`);
      console.log(`   ✅ Tauri: ${tauriDir}`);
    } catch (e) {
      console.error(`   ❌ Desktop UI Fehler: ${e.message}`);
    }
  }

  // 4. Generate Tests
  console.log('🧪 Generiere Tests...');
  try {
    const tests = generatePropertyTests(result.plan);
    const testsDir = path.join(outputDir, 'tests');
    if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });
    fs.writeFileSync(path.join(testsDir, 'property-tests.js'), tests, 'utf8');
    console.log(`   ✅ Property Tests: ${testsDir}/property-tests.js`);
  } catch (e) {
    console.error(`   ❌ Tests Fehler: ${e.message}`);
  }

  // 5. Generate Docker
  console.log('🐳 Generiere Docker...');
  try {
    const docker = generateDocker(result.plan, result.intent, 'python');
    const dockerDir = path.join(outputDir, 'docker');
    if (!fs.existsSync(dockerDir)) fs.mkdirSync(dockerDir, { recursive: true });
    fs.writeFileSync(path.join(dockerDir, 'Dockerfile'), docker.dockerfile, 'utf8');
    fs.writeFileSync(path.join(dockerDir, 'docker-compose.yml'), docker.dockerCompose, 'utf8');
    console.log(`   ✅ Docker: ${dockerDir}/Dockerfile`);
  } catch (e) {
    console.error(`   ❌ Docker Fehler: ${e.message}`);
  }

  // 6. Generate Kubernetes
  console.log('☸️ Generiere Kubernetes...');
  try {
    const k8s = generateK8s(result.plan, result.intent);
    const k8sDir = path.join(outputDir, 'k8s');
    if (!fs.existsSync(k8sDir)) fs.mkdirSync(k8sDir, { recursive: true });
    fs.writeFileSync(path.join(k8sDir, 'deployment.yaml'), k8s.deployment, 'utf8');
    fs.writeFileSync(path.join(k8sDir, 'service.yaml'), k8s.service, 'utf8');
    fs.writeFileSync(path.join(k8sDir, 'ingress.yaml'), k8s.ingress, 'utf8');
    console.log(`   ✅ Kubernetes: ${k8sDir}/`);
  } catch (e) {
    console.error(`   ❌ Kubernetes Fehler: ${e.message}`);
  }

  // 7. Generate README
  const readme = generateREADME(result);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme, 'utf8');
  console.log(`   ✅ README: ${outputDir}/README.md`);

  console.log('');
  console.log('✅ Vollständiges Programm generiert!');
  console.log(`   📁 Alle Dateien in: ${outputDir}`);
  console.log('');
  console.log('📊 Zusammenfassung:');
  console.log(`   - Code-Dateien: ${result.files.length}`);
  console.log(`   - UI: ${result.ui ? 'Web PWA' : 'Keine'}`);
  console.log(`   - Mobile: ${result.intent.targets.includes('mobile') ? 'React Native + Flutter' : 'Keine'}`);
  console.log(`   - Desktop: ${result.intent.targets.includes('desktop') ? 'Electron + Tauri' : 'Keine'}`);
  console.log(`   - Tests: Property Tests`);
  console.log(`   - Docker: Dockerfile + docker-compose.yml`);
  console.log(`   - Kubernetes: deployment + service + ingress`);
  console.log('');

  return result;
}

function generateREADME(result) {
  return `# ${result.metadata.category}

**Auto-generated Program**  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**Generated:** ${result.metadata.timestamp}

---

## 📝 Prompt

\`\`\`
${result.intent.text}
\`\`\`

---

## 📊 Metadaten

- **Kategorie:** ${result.metadata.category}
- **Domains:** ${result.metadata.domains.join(', ')}
- **Targets:** ${result.metadata.targets.join(', ')}
- **Privacy:** ${result.intent.privacy}
- **Performance:** ${result.intent.performance}

---

## 📁 Generierte Dateien

### Code (${result.files.length} Sprachen)

${result.files.map(f => `- **${f.language}:** \`${f.path}\``).join('\n')}

### UI

${result.ui ? '- **Web PWA:** `index.html`, `style.css`, `app.js`, `manifest.json`' : '- Keine Web UI'}
${result.intent.targets.includes('mobile') ? '- **Mobile:** `mobile/react-native/`, `mobile/flutter/`' : ''}
${result.intent.targets.includes('desktop') ? '- **Desktop:** `desktop/electron/`, `desktop/tauri/`' : ''}

### Tests

- **Property Tests:** \`tests/property-tests.js\`

### Deployment

- **Docker:** \`docker/Dockerfile\`, \`docker/docker-compose.yml\`
- **Kubernetes:** \`k8s/deployment.yaml\`, \`k8s/service.yaml\`, \`k8s/ingress.yaml\`

---

## 🚀 Verwendung

### Python
\`\`\`bash
python program.py
\`\`\`

### Node.js
\`\`\`bash
node program.js
\`\`\`

### Docker
\`\`\`bash
cd docker
docker-compose up
\`\`\`

### Kubernetes
\`\`\`bash
kubectl apply -f k8s/
\`\`\`

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV
`;
}

// CLI
if (require.main === module) {
  const prompt = process.argv.slice(2).join(' ') || "Erstelle ein Haushaltsbuch mit Solar-Energie-Berechnung";
  const outputDir = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || './generated-complete';

  generateComplete(prompt, outputDir);
}

module.exports = { generateComplete };


