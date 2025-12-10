// [.SYSTEMS.T.SYSTEMS.] DAG Planer aus manifest.yaml
// Generiert ausführbaren DAG mit Stufen für Console-Bypass Pipeline

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const manifestPath = process.argv[2] || 'factory.manifest.yaml';
const outputPath = process.argv[3] || '.plan.json';

try {
  const manifest = yaml.load(fs.readFileSync(manifestPath, 'utf8'));
  
  const plan = {
    version: manifest.version || '1.0.0',
    project: manifest.project,
    timestamp: new Date().toISOString(),
    modules: [],
    dag: {
      nodes: [],
      edges: []
    }
  };
  
  // Build dependency graph
  const moduleMap = new Map();
  manifest.modules.forEach(mod => {
    moduleMap.set(mod.name, mod);
    plan.modules.push({
      name: mod.name,
      path: mod.path,
      language: mod.language,
      pipeline: mod.pipeline || ['generate', 'build', 'test', 'package', 'publish'],
      dependencies: mod.dependencies || []
    });
    
    // Add nodes for each pipeline stage
    mod.pipeline.forEach(stage => {
      plan.dag.nodes.push({
        id: `${mod.name}-${stage}`,
        module: mod.name,
        stage,
        type: 'task'
      });
    });
    
    // Add edges for pipeline stages
    for (let i = 0; i < mod.pipeline.length - 1; i++) {
      plan.dag.edges.push({
        from: `${mod.name}-${mod.pipeline[i]}`,
        to: `${mod.name}-${mod.pipeline[i + 1]}`,
        type: 'pipeline'
      });
    }
    
    // Add edges for dependencies
    (mod.dependencies || []).forEach(dep => {
      const depMod = moduleMap.get(dep);
      if (depMod) {
        const lastStage = depMod.pipeline[depMod.pipeline.length - 1];
        const firstStage = mod.pipeline[0];
        plan.dag.edges.push({
          from: `${dep}-${lastStage}`,
          to: `${mod.name}-${firstStage}`,
          type: 'dependency'
        });
      }
    });
  });
  
  fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));
  console.log(`[FABRIKAGE] DAG Plan generiert: ${outputPath}`);
  console.log(`  Module: ${plan.modules.length}`);
  console.log(`  Nodes: ${plan.dag.nodes.length}`);
  console.log(`  Edges: ${plan.dag.edges.length}`);
} catch(e) {
  console.error('[FABRIKAGE] DAG Plan Fehler:', e);
  process.exit(1);
}
