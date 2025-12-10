// nBlockbuster Seed Data Loader
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV
//
// Lädt YAML/JSON Seeds in die Datenbank

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/manifest_hive',
});

async function loadSeeds() {
  const seedsDir = path.join(__dirname);
  const currentYear = new Date().getFullYear();
  
  // Lade YAML-Dateien
  const yamlFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.yaml'));
  
  for (const file of yamlFiles) {
    try {
      const content = fs.readFileSync(path.join(seedsDir, file), 'utf8');
      const data = yaml.load(content);
      
      if (data.id && data.title) {
        // Content Item
        const spanTag = (currentYear - data.year) >= 50 ? '50+' : '50-';
        
        await pool.query(
          `INSERT INTO nb_content (id, title, year, span_tag, type, culture, language, country, license, synopsis, tags, embed, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             year = EXCLUDED.year,
             span_tag = EXCLUDED.span_tag,
             type = EXCLUDED.type,
             culture = EXCLUDED.culture,
             language = EXCLUDED.language,
             country = EXCLUDED.country,
             license = EXCLUDED.license,
             synopsis = EXCLUDED.synopsis,
             tags = EXCLUDED.tags,
             embed = EXCLUDED.embed,
             updated_at = NOW()`,
          [
            data.id,
            data.title,
            data.year,
            spanTag,
            data.type,
            data.culture || null,
            data.language || null,
            data.country || null,
            data.license || null,
            data.synopsis || null,
            JSON.stringify(data.tags || []),
            JSON.stringify(data.embed || {})
          ]
        );
        
        // Lade Sources
        if (data.sources && Array.isArray(data.sources)) {
          for (const source of data.sources) {
            await pool.query(
              `INSERT INTO nb_sources (content_id, ref_type, url, note, verified)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT DO NOTHING`,
              [
                data.id,
                source.type,
                source.url,
                source.note || null,
                source.verified || false
              ]
            );
          }
        }
        
        console.log(`✅ Loaded: ${data.id}`);
      } else if (data.id && data.years) {
        // Collection
        await pool.query(
          `INSERT INTO nb_collections (id, title, years, theme, description, visibility, curator_alias, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             years = EXCLUDED.years,
             theme = EXCLUDED.theme,
             description = EXCLUDED.description,
             visibility = EXCLUDED.visibility,
             updated_at = NOW()`,
          [
            data.id,
            data.title,
            JSON.stringify(data.years),
            data.theme || null,
            data.description || null,
            data.visibility || 'public',
            data.curator_alias || null
          ]
        );
        
        // Füge Items hinzu
        if (data.items && Array.isArray(data.items)) {
          await pool.query('DELETE FROM nb_collection_items WHERE collection_id = $1', [data.id]);
          
          for (let i = 0; i < data.items.length; i++) {
            await pool.query(
              'INSERT INTO nb_collection_items (collection_id, content_id, order_index) VALUES ($1, $2, $3)',
              [data.id, data.items[i], i]
            );
          }
        }
        
        console.log(`✅ Loaded collection: ${data.id}`);
      }
    } catch (e) {
      console.error(`❌ Error loading ${file}:`, e.message);
    }
  }
  
  // Lade JSON Year Index Files
  const jsonFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.json') && f.startsWith('year-index'));
  
  for (const file of jsonFiles) {
    try {
      const content = fs.readFileSync(path.join(seedsDir, file), 'utf8');
      const data = JSON.parse(content);
      
      await pool.query(
        `INSERT INTO nb_year_index (year, decade, span_tags, highlights, collections, editorial_notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (year) DO UPDATE SET
           decade = EXCLUDED.decade,
           span_tags = EXCLUDED.span_tags,
           highlights = EXCLUDED.highlights,
           collections = EXCLUDED.collections,
           editorial_notes = EXCLUDED.editorial_notes,
           updated_at = NOW()`,
        [
          data.year,
          data.decade || null,
          JSON.stringify(data.spanTags || []),
          JSON.stringify(data.highlights || []),
          JSON.stringify(data.collections || []),
          data.editorialNotes || null
        ]
      );
      
      console.log(`✅ Loaded year index: ${data.year}`);
    } catch (e) {
      console.error(`❌ Error loading ${file}:`, e.message);
    }
  }
  
  console.log('✅ All seeds loaded');
  await pool.end();
}

// Run
loadSeeds().catch(console.error);


