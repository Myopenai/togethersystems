// Orchestrator - Create Green Bundle
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const bundleDir = path.join(__dirname, 'bundle');
if (!fs.existsSync(bundleDir)) {
  fs.mkdirSync(bundleDir, { recursive: true });
}

function createBundle() {
  const bundle = {
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    branding: '.T. TogetherSystems - ModularFlux Architecture',
    standard: 'IBM STANDARD - PERMANENT AKTIV',
    
    git: {
      commit: execSync('git rev-parse HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      tag: getGitTag()
    },
    
    artifacts: {},
    checksums: {},
    sbom: null,
    evidence: null
  };
  
  // Load evidence pack
  const evidenceFile = path.join(__dirname, 'evidence/evidence-pack.json');
  if (fs.existsSync(evidenceFile)) {
    bundle.evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
  }
  
  // Load checksums
  const checksumsFile = path.join(__dirname, '../verifier-mesh/results/checksums.json');
  if (fs.existsSync(checksumsFile)) {
    bundle.checksums = JSON.parse(fs.readFileSync(checksumsFile, 'utf8'));
  }
  
  // Load SBOM
  const sbomFile = path.join(process.cwd(), 'sbom.json');
  if (fs.existsSync(sbomFile)) {
    bundle.sbom = JSON.parse(fs.readFileSync(sbomFile, 'utf8'));
  }
  
  // Generate artifact checksums
  const artifactDirs = ['dist', 'build', 'output'];
  for (const dir of artifactDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      bundle.artifacts[dir] = generateDirectoryChecksums(fullPath);
    }
  }
  
  // Save bundle
  const bundleFile = path.join(bundleDir, 'green-bundle.json');
  fs.writeFileSync(bundleFile, JSON.stringify(bundle, null, 2));
  
  // Generate bundle checksum
  const bundleContent = fs.readFileSync(bundleFile);
  const bundleChecksum = crypto.createHash('sha256').update(bundleContent).digest('hex');
  
  fs.writeFileSync(
    path.join(bundleDir, 'bundle.sha256'),
    `${bundleChecksum}  green-bundle.json\n`
  );
  
  console.log('Green bundle created:', bundleFile);
  console.log('Bundle checksum:', bundleChecksum);
  
  return bundle;
}

function getGitTag() {
  try {
    return execSync('git describe --tags --exact-match HEAD 2>/dev/null').toString().trim() || null;
  } catch {
    return null;
  }
}

function generateDirectoryChecksums(dir) {
  const checksums = {};
  const files = fs.readdirSync(dir, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      checksums[file] = crypto.createHash('sha256').update(content).digest('hex');
    }
  }
  
  return checksums;
}

createBundle();



