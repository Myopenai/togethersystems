// Script to load all documentation files and create database
const fs = require('fs');
const path = require('path');

// Read docs-list.json
const docsListPath = path.join(__dirname, '..', 'docs-list.json');
const outputPath = path.join(__dirname, '..', 'docs-database.json');

try {
    const docsList = JSON.parse(fs.readFileSync(docsListPath, 'utf8'));
    
    const docsDB = docsList
        .filter(file => file.Name && file.Name.endsWith('.md'))
        .map(file => {
            const name = file.Name.replace('.md', '');
            const fullPath = file.FullName;
            const relativePath = fullPath.split('THYNK ORDNER PRODUCTION')[1]?.replace(/\\/g, '/').substring(1) || file.Name;
            
            // Extract category
            let category = 'Dokumentation';
            if (relativePath.includes('tests')) category = 'Tests';
            if (relativePath.toLowerCase().includes('handbuch') || name.toLowerCase().includes('handbuch')) category = 'Handbücher';
            if (relativePath.toLowerCase().includes('anleitung') || name.toLowerCase().includes('anleitung')) category = 'Anleitungen';
            if (relativePath.toLowerCase().includes('development') || name.toLowerCase().includes('entwicklung')) category = 'Entwicklung';
            if (name.toLowerCase().includes('rechnung') || name.toLowerCase().includes('factuur') || name.toLowerCase().includes('kalkulation')) category = 'Administration';
            
            // Generate keywords
            const keywords = generateKeywords(name, relativePath);
            
            // Detect language
            const language = detectLanguage(name);
            
            // Generate tags
            const tags = extractTags(name, relativePath);
            
            return {
                id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                title: formatTitle(name),
                description: generateDescription(name, relativePath),
                tags: tags,
                path: relativePath,
                category: category,
                keywords: keywords,
                language: language,
                fullPath: fullPath
            };
        });
    
    // Write database
    fs.writeFileSync(outputPath, JSON.stringify(docsDB, null, 2), 'utf8');
    
    console.log(`✅ ${docsDB.length} Dokumentationen erfolgreich verarbeitet!`);
    console.log(`📄 Datenbank gespeichert in: ${outputPath}`);
    
} catch (error) {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
}

// Helper functions
function formatTitle(name) {
    return name
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/.md/g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function generateDescription(name, path) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('handbuch')) return 'Vollständiges Handbuch mit detaillierten Anleitungen';
    if (nameLower.includes('anleitung')) return 'Schritt-für-Schritt Anleitung';
    if (nameLower.includes('test')) return 'Test-Dokumentation und Test-Anleitungen';
    if (nameLower.includes('doku') || nameLower.includes('documentation')) return 'Technische Dokumentation';
    if (nameLower.includes('readme')) return 'Übersicht und Schnellstart';
    if (nameLower.includes('rechnung') || nameLower.includes('factuur')) return 'Rechnung/Kalkulation';
    if (nameLower.includes('status')) return 'Status-Report und Übersicht';
    if (nameLower.includes('deployment')) return 'Deployment-Anleitungen';
    
    return 'Dokumentation für Think Orders System';
}

function extractTags(name, path) {
    const tags = [];
    const nameLower = name.toLowerCase();
    const pathLower = path.toLowerCase();
    
    // Language tags
    if (nameLower.includes('-de-') || nameLower.includes('_de_') || nameLower.includes('deutsch')) tags.push('Deutsch');
    if (nameLower.includes('-nl-') || nameLower.includes('_nl_') || nameLower.includes('nederlands')) tags.push('Nederlands');
    if (nameLower.includes('-en-') || nameLower.includes('_en_') || nameLower.includes('english')) tags.push('English');
    
    // Content tags
    if (nameLower.includes('dummies') || nameLower.includes('anfänger')) tags.push('Anfänger');
    if (nameLower.includes('test')) tags.push('Tests');
    if (nameLower.includes('handbuch')) tags.push('Handbuch');
    if (nameLower.includes('anleitung')) tags.push('Anleitung');
    if (nameLower.includes('rechnung') || nameLower.includes('factuur')) tags.push('Rechnung');
    if (nameLower.includes('deployment')) tags.push('Deployment');
    if (nameLower.includes('status')) tags.push('Status');
    
    if (tags.length === 0) tags.push('Dokumentation');
    
    return tags;
}

function generateKeywords(name, path) {
    const keywords = [];
    const nameLower = name.toLowerCase();
    const pathLower = path.toLowerCase();
    
    // Common keywords
    if (nameLower.includes('test')) keywords.push('test', 'tests', 'testing', 'playwright');
    if (nameLower.includes('handbuch')) keywords.push('handbuch', 'handbook', 'anleitung', 'guide');
    if (nameLower.includes('anleitung')) keywords.push('anleitung', 'guide', 'tutorial', 'hilfe');
    if (nameLower.includes('doku') || nameLower.includes('documentation')) keywords.push('dokumentation', 'doku', 'docs');
    if (nameLower.includes('dummies')) keywords.push('dummies', 'anfänger', 'beginner', 'quick start');
    if (nameLower.includes('installation')) keywords.push('installation', 'installieren', 'setup');
    if (nameLower.includes('erweiterung')) keywords.push('erweitern', 'extension', 'entwicklung');
    if (nameLower.includes('rechnung') || nameLower.includes('factuur')) keywords.push('rechnung', 'factuur', 'kalkulation', 'kosten');
    
    // Simple language versions
    keywords.push('wie teste ich', 'wie installiere ich', 'fehler beheben', 'was ist ein terminal');
    
    // Path keywords
    if (pathLower.includes('tests')) keywords.push('tests', 'testing');
    if (pathLower.includes('think-orders')) keywords.push('think-orders', 'orders');
    
    return [...new Set(keywords)];
}

function detectLanguage(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('-de-') || nameLower.includes('_de_') || nameLower.includes('deutsch')) return 'DE';
    if (nameLower.includes('-nl-') || nameLower.includes('_nl_') || nameLower.includes('nederlands')) return 'NL';
    if (nameLower.includes('-en-') || nameLower.includes('_en_') || nameLower.includes('english')) return 'EN';
    return 'DE';
}

