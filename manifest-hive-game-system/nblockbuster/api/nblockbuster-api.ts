// nBlockbuster API Endpoints
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

import express from 'express';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// ============================================
// CONTENT DISCOVERY
// ============================================

// GET /nb/catalog?year=&spanTag=&type=&culture=&query=
router.get('/catalog', async (req, res) => {
  try {
    const { year, spanTag, type, culture, query } = req.query;
    let sql = 'SELECT * FROM nb_content WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (year) {
      paramCount++;
      params.push(parseInt(year as string));
      sql += ` AND year = $${paramCount}`;
    }
    
    if (spanTag) {
      paramCount++;
      params.push(spanTag);
      sql += ` AND span_tag = $${paramCount}`;
    }
    
    if (type) {
      paramCount++;
      params.push(type);
      sql += ` AND type = $${paramCount}`;
    }
    
    if (culture) {
      paramCount++;
      params.push(culture);
      sql += ` AND culture = $${paramCount}`;
    }
    
    if (query) {
      paramCount++;
      params.push(`%${query}%`);
      sql += ` AND (title ILIKE $${paramCount} OR synopsis ILIKE $${paramCount})`;
    }
    
    sql += ' ORDER BY year DESC, title';
    
    const result = await (req as any).db.query(sql, params);
    
    // Füge Sources hinzu
    const items = await Promise.all(result.rows.map(async (item: any) => {
      const sources = await (req as any).db.query(
        'SELECT * FROM nb_sources WHERE content_id = $1',
        [item.id]
      );
      return { ...item, sources: sources.rows };
    }));
    
    res.json({ items, total: items.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /nb/year/:year
router.get('/year/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const currentYear = new Date().getFullYear();
    const spanTag = (currentYear - year) >= 50 ? '50+' : '50-';
    
    // Hole Year Index
    const indexResult = await (req as any).db.query(
      'SELECT * FROM nb_year_index WHERE year = $1',
      [year]
    );
    
    // Hole Content Items für dieses Jahr
    const contentResult = await (req as any).db.query(
      'SELECT * FROM nb_content WHERE year = $1 ORDER BY type, title',
      [year]
    );
    
    // Gruppiere nach 50+/50-
    const items50Plus = contentResult.rows.filter((item: any) => item.span_tag === '50+');
    const items50Minus = contentResult.rows.filter((item: any) => item.span_tag === '50-');
    
    // Hole Collections
    const collectionsResult = await (req as any).db.query(
      `SELECT * FROM nb_collections WHERE $1 = ANY(years) AND visibility = 'public'`,
      [year]
    );
    
    // Hole Memories
    const memoriesResult = await (req as any).db.query(
      `SELECT * FROM nb_memories WHERE year = $1 AND moderation_status = 'approved' ORDER BY created_at DESC LIMIT 20`,
      [year]
    );
    
    const index = indexResult.rows[0] || {
      year,
      decade: `${Math.floor(year / 10) * 10}s`,
      spanTags: [spanTag],
      highlights: [],
      collections: [],
      editorialNotes: null
    };
    
    res.json({
      year,
      decade: index.decade,
      spanTags: index.spanTags || [spanTag],
      items50Plus,
      items50Minus,
      highlights: index.highlights || [],
      collections: collectionsResult.rows,
      memories: memoriesResult.rows,
      editorialNotes: index.editorialNotes
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /nb/item/:id
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hole Content
    const contentResult = await (req as any).db.query(
      'SELECT * FROM nb_content WHERE id = $1',
      [id]
    );
    
    if (contentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const content = contentResult.rows[0];
    
    // Hole Sources
    const sourcesResult = await (req as any).db.query(
      'SELECT * FROM nb_sources WHERE content_id = $1 ORDER BY verified DESC, ref_type',
      [id]
    );
    
    // Hole related Games
    const gamesResult = await (req as any).db.query(
      `SELECT g.*, cg.suggested_mode, cg.notes 
       FROM nb_cultural_games cg 
       JOIN games g ON cg.game_id = g.id 
       WHERE cg.content_id = $1`,
      [id]
    );
    
    // Hole Collections die dieses Item enthalten
    const collectionsResult = await (req as any).db.query(
      `SELECT c.* FROM nb_collections c
       JOIN nb_collection_items ci ON c.id = ci.collection_id
       WHERE ci.content_id = $1`,
      [id]
    );
    
    res.json({
      content,
      sources: sourcesResult.rows,
      relatedGames: gamesResult.rows,
      collections: collectionsResult.rows
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /nb/collection
router.post('/collection', async (req, res) => {
  try {
    const { id, title, years, theme, description, visibility, curator_alias, items } = req.body;
    
    const collectionId = id || `collection_${uuidv4().substring(0, 8)}`;
    
    await (req as any).db.query(
      `INSERT INTO nb_collections (id, title, years, theme, description, visibility, curator_alias)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         years = EXCLUDED.years,
         theme = EXCLUDED.theme,
         description = EXCLUDED.description,
         visibility = EXCLUDED.visibility,
         updated_at = NOW()`,
      [collectionId, title, JSON.stringify(years), theme, description, visibility || 'public', curator_alias]
    );
    
    // Füge Items hinzu
    if (items && Array.isArray(items)) {
      // Lösche alte Items
      await (req as any).db.query(
        'DELETE FROM nb_collection_items WHERE collection_id = $1',
        [collectionId]
      );
      
      // Füge neue Items hinzu
      for (let i = 0; i < items.length; i++) {
        await (req as any).db.query(
          'INSERT INTO nb_collection_items (collection_id, content_id, order_index) VALUES ($1, $2, $3)',
          [collectionId, items[i], i]
        );
      }
    }
    
    res.json({ ok: true, collection_id: collectionId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// HIVE LINKAGE
// ============================================

// POST /nb/hive/launch
router.post('/hive/launch', async (req, res) => {
  try {
    const { itemId, mode, hiveType, seriousness, publicNumber } = req.body;
    
    // Prüfe ob Content existiert
    const contentResult = await (req as any).db.query(
      'SELECT * FROM nb_content WHERE id = $1',
      [itemId]
    );
    
    if (contentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const content = contentResult.rows[0];
    
    // Erstelle HiveRoom (nutze bestehende Logik)
    const roomId = uuidv4();
    const finalPublicNumber = publicNumber || (hiveType === 'PUBLIC_NUMBER' ? Math.floor(Math.random() * 1000000) + 100000 : null);
    
    await (req as any).db.query(
      `INSERT INTO hive_rooms (id, owner_id, visibility, public_number, style, title, description, is_game_room, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW())`,
      [roomId, req.body.user_id || 'system', hiveType || 'PUBLIC_NUMBER', finalPublicNumber, 
       seriousness || 'serious', `Wabe: ${content.title}`, content.synopsis || '']
    );
    
    // Verknüpfe Content mit HiveRoom
    await (req as any).db.query(
      'INSERT INTO nb_hive_content (hive_room_id, content_id, mode) VALUES ($1, $2, $3)',
      [roomId, itemId, mode || 'watch']
    );
    
    // Hole suggested Games
    const gamesResult = await (req as any).db.query(
      `SELECT g.*, cg.suggested_mode 
       FROM nb_cultural_games cg 
       JOIN games g ON cg.game_id = g.id 
       WHERE cg.content_id = $1`,
      [itemId]
    );
    
    res.json({
      ok: true,
      hive_room_id: roomId,
      public_number: finalPublicNumber,
      joinUrl: `/hive/${finalPublicNumber || roomId}`,
      content: content,
      suggestedGames: gamesResult.rows,
      ritualOverlay: {
        intro: "Wir öffnen einen Raum, der Erinnerung würdig hält: reine Quellen, geteilte Geschichten, Spiel als friedlicher Dialog. Willkommen.",
        seriousness: seriousness || 'serious'
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /nb/hive/suggest_games/:itemId
router.get('/hive/suggest_games/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const gamesResult = await (req as any).db.query(
      `SELECT g.*, cg.suggested_mode, cg.notes 
       FROM nb_cultural_games cg 
       JOIN games g ON cg.game_id = g.id 
       WHERE cg.content_id = $1`,
      [itemId]
    );
    
    // Falls keine spezifischen Games, hole generische Vorschläge
    if (gamesResult.rows.length === 0) {
      const genericGames = await (req as any).db.query(
        `SELECT * FROM games WHERE category IN ('COMMUNICATION', 'SOCIAL') ORDER BY RANDOM() LIMIT 5`
      );
      res.json({ suggestions: genericGames.rows });
      return;
    }
    
    res.json({ suggestions: gamesResult.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// NOSTALGIA CONTRIBUTIONS
// ============================================

// POST /nb/memory
router.post('/memory', async (req, res) => {
  try {
    const { alias, year, contentId, text, mediaUrl } = req.body;
    
    if (!alias || !text) {
      return res.status(400).json({ error: 'alias and text required' });
    }
    
    if (!year && !contentId) {
      return res.status(400).json({ error: 'year or contentId required' });
    }
    
    const memoryId = uuidv4();
    
    await (req as any).db.query(
      `INSERT INTO nb_memories (id, alias, year, content_id, text, media_url, moderation_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
      [memoryId, alias, year || null, contentId || null, text, mediaUrl || null]
    );
    
    res.json({ ok: true, memory_id: memoryId, status: 'pending' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /nb/memory/:year
router.get('/memory/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    const result = await (req as any).db.query(
      `SELECT * FROM nb_memories 
       WHERE year = $1 AND moderation_status = 'approved' 
       ORDER BY created_at DESC LIMIT 50`,
      [year]
    );
    
    res.json({ memories: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// EDITORIAL VERIFICATION
// ============================================

// POST /nb/reference
router.post('/reference', async (req, res) => {
  try {
    const { contentId, refType, url, note } = req.body;
    
    if (!contentId || !refType || !url) {
      return res.status(400).json({ error: 'contentId, refType, url required' });
    }
    
    const refId = uuidv4();
    
    await (req as any).db.query(
      `INSERT INTO nb_sources (id, content_id, ref_type, url, note, verified)
       VALUES ($1, $2, $3, $4, $5, FALSE)`,
      [refId, contentId, refType, url, note || null]
    );
    
    res.json({ ok: true, reference_id: refId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /nb/reference/verify
router.post('/reference/verify', async (req, res) => {
  try {
    const { referenceId, verified } = req.body;
    
    await (req as any).db.query(
      'UPDATE nb_sources SET verified = $1 WHERE id = $2',
      [verified === true, referenceId]
    );
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


