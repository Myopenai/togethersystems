/**
 * TELBANK Transformation Engine - Vollständige Implementierung
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL-COMPLETE
 * Branding: T,.&T,,.&T,,,.TELBANK(C)(R)
 * 
 * Transformiert Negative Assets in positive, unternehmerische Handlungen.
 * Nullpunkt-Konzept: "Aus dem Dunkeln ins Licht"
 */

class TransformationEngineComplete {
  constructor(db) {
    this.db = db;
    this.nullpointThreshold = 0; // Nullpunkt = 0 (aus dem Dunkeln ins Licht)
  }

  /**
   * Hauptfunktion: Transformation ausführen
   */
  async executeTransformation(transformId) {
    // 1. Transformation laden
    const transform = await this.db.prepare(`
      SELECT * FROM transformation_action WHERE transform_id = ?
    `).bind(transformId).first();

    if (!transform) {
      throw new Error(`Transformation ${transformId} nicht gefunden`);
    }

    if (transform.result_state !== 'planned') {
      throw new Error(`Transformation bereits ausgeführt oder abgebrochen: ${transform.result_state}`);
    }

    // 2. Negative Asset laden
    const asset = await this.db.prepare(`
      SELECT * FROM negative_asset WHERE neg_asset_id = ?
    `).bind(transform.neg_asset_id).first();

    if (!asset) {
      throw new Error(`Negative Asset ${transform.neg_asset_id} nicht gefunden`);
    }

    // 3. Transformation ausführen (je nach action_type)
    const now = new Date().toISOString();
    let effectAmount = transform.effect_amount || 0;

    switch (transform.action_type) {
      case 'restructuring':
        effectAmount = await this.executeRestructuring(asset, transform);
        break;
      case 'debt_purchase':
        effectAmount = await this.executeDebtPurchase(asset, transform);
        break;
      case 'writeoff':
        effectAmount = await this.executeWriteoff(asset, transform);
        break;
      case 'swap':
        effectAmount = await this.executeSwap(asset, transform);
        break;
      case 'netting':
        effectAmount = await this.executeNetting(asset, transform);
        break;
      case 'transformation_workflow':
        effectAmount = await this.executeTransformationWorkflow(asset, transform);
        break;
      default:
        throw new Error(`Unbekannter action_type: ${transform.action_type}`);
    }

    // 4. Transformation als ausgeführt markieren
    await this.db.prepare(`
      UPDATE transformation_action
      SET result_state = 'executed', executed_at = ?, effect_amount = ?
      WHERE transform_id = ?
    `).bind(now, effectAmount, transformId).run();

    // 5. Negative Asset Status aktualisieren basierend auf Nullpunkt-Status
    const nullpointStatus = await this.calculateNullpointStatus(asset.neg_asset_id);
    let newStatus = asset.status;

    if (nullpointStatus.status === 'beyond_nullpoint') {
      newStatus = 'resolved';
      // Asset ist aus dem Dunkeln ins Licht → Nullpunkt überschritten
    } else if (nullpointStatus.status === 'improving') {
      newStatus = 'in_transformation';
      // Asset wird besser → noch im Transformationsprozess
    } else if (nullpointStatus.status === 'worse_or_unchanged') {
      newStatus = 'reported'; // Zurück zum Anfang, neue Strategie nötig
    }

    await this.db.prepare(`
      UPDATE negative_asset
      SET status = ?, updated_at = ?
      WHERE neg_asset_id = ?
    `).bind(newStatus, now, asset.neg_asset_id).run();

    // 6. Ledger-Eintrag erstellen
    const ledgerId = crypto.randomUUID();
    const entryType = effectAmount >= 0 ? 'plus_out' : 'minus_in';
    
    await this.db.prepare(`
      INSERT INTO telbank_ledger (
        ledger_entry_id, neg_asset_id, transform_id, entry_type,
        currency_code, amount, booked_at, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      ledgerId, asset.neg_asset_id, transformId, entryType,
      asset.currency_code, effectAmount, now,
      `Transformation ${transform.action_type}: ${transform.description || ''}`, now
    ).run();

    // 7. Nullpunkt-Event loggen (wenn Nullpunkt erreicht/überschritten)
    if (nullpointStatus.status === 'beyond_nullpoint') {
      await this.logNullpointEvent(asset.neg_asset_id, nullpointStatus);
    }

    return {
      success: true,
      transformId,
      effectAmount,
      nullpointStatus,
      newAssetStatus: newStatus,
      ledgerEntryId: ledgerId
    };
  }

  /**
   * Nullpunkt-Status berechnen (View-basiert)
   */
  async calculateNullpointStatus(negAssetId) {
    const result = await this.db.prepare(`
      SELECT 
        neg_asset_id,
        nominal_amount,
        total_effect,
        residual_amount,
        status,
        provider_bank_id,
        currency_code,
        event_date
      FROM negative_asset_nullpoint_status
      WHERE neg_asset_id = ?
    `).bind(negAssetId).first();

    if (!result) {
      // Fallback: Manuelle Berechnung
      return await this.calculateNullpointStatusManual(negAssetId);
    }

    return {
      negAssetId: result.neg_asset_id,
      nominalAmount: result.nominal_amount,
      totalEffect: result.total_effect || 0,
      residualAmount: result.residual_amount || result.nominal_amount,
      status: result.status, // 'beyond_nullpoint' | 'improving' | 'worse_or_unchanged'
      providerBankId: result.provider_bank_id,
      currencyCode: result.currency_code,
      eventDate: result.event_date,
      isBeyondNullpoint: result.residual_amount >= this.nullpointThreshold
    };
  }

  /**
   * Manuelle Nullpunkt-Berechnung (Fallback)
   */
  async calculateNullpointStatusManual(negAssetId) {
    // Negative Asset laden
    const asset = await this.db.prepare(`
      SELECT * FROM negative_asset WHERE neg_asset_id = ?
    `).bind(negAssetId).first();

    if (!asset) {
      throw new Error(`Negative Asset ${negAssetId} nicht gefunden`);
    }

    // Alle Transformationen summieren
    const transformations = await this.db.prepare(`
      SELECT effect_amount FROM transformation_action
      WHERE neg_asset_id = ? AND result_state = 'executed'
    `).bind(negAssetId).all();

    const totalEffect = transformations.results.reduce(
      (sum, t) => sum + (t.effect_amount || 0), 0
    );

    const residualAmount = asset.nominal_amount + totalEffect;

    let status = 'worse_or_unchanged';
    if (residualAmount >= this.nullpointThreshold) {
      status = 'beyond_nullpoint';
    } else if (totalEffect > 0) {
      status = 'improving';
    }

    return {
      negAssetId: asset.neg_asset_id,
      nominalAmount: asset.nominal_amount,
      totalEffect,
      residualAmount,
      status,
      providerBankId: asset.provider_bank_id,
      currencyCode: asset.currency_code,
      eventDate: asset.event_date,
      isBeyondNullpoint: residualAmount >= this.nullpointThreshold
    };
  }

  /**
   * Restructuring (Umschuldung, Laufzeitverlängerung)
   */
  async executeRestructuring(asset, transform) {
    // Beispiel: Reduziere Nominalbetrag um 20%, verlängere Laufzeit
    const reductionFactor = 0.2;
    const effectAmount = Math.abs(asset.nominal_amount * reductionFactor);

    // In Realität: Hier würde man mit Bank verhandeln, Verträge anpassen
    // Hier simulieren wir nur den Effekt

    return effectAmount;
  }

  /**
   * Debt Purchase (Forderungskauf)
   */
  async executeDebtPurchase(asset, transform) {
    // Beispiel: Kauf der Forderung zu 30% des Nominalbetrags
    const purchasePriceRatio = 0.3;
    const purchasePrice = Math.abs(asset.nominal_amount * purchasePriceRatio);
    
    // Effekt: Asset wird neutralisiert (purchasePrice positiv), aber wir zahlen purchasePrice
    // Netto-Effekt: nominal_amount wird um purchasePrice reduziert (aber wir haben Ausgabe)
    
    const effectAmount = Math.abs(asset.nominal_amount) - purchasePrice;
    
    return effectAmount;
  }

  /**
   * Writeoff (Abschreibung)
   */
  async executeWriteoff(asset, transform) {
    // Vollständige Abschreibung → Asset wird komplett neutralisiert
    return Math.abs(asset.nominal_amount);
  }

  /**
   * Swap (Tausch)
   */
  async executeSwap(asset, transform) {
    // Beispiel: Tausch gegen andere Asset-Klasse oder andere Währung
    // Hier: Wir simulieren einen positiven Effekt durch Tausch
    const swapValue = transform.effect_amount || Math.abs(asset.nominal_amount * 0.5);
    
    return swapValue;
  }

  /**
   * Netting (Verrechnung)
   */
  async executeNetting(asset, transform) {
    // Beispiel: Verrechnung mit positiven Positionen derselben Bank
    // Hier: Wir simulieren einen Netting-Effekt
    const nettingAmount = transform.effect_amount || Math.abs(asset.nominal_amount * 0.4);
    
    return nettingAmount;
  }

  /**
   * Transformation Workflow (Multi-Step)
   */
  async executeTransformationWorkflow(asset, transform) {
    // Komplexer Workflow mit mehreren Schritten
    // Beispiel: Restructuring → Debt Purchase → Netting
    
    let totalEffect = 0;
    
    // Schritt 1: Restructuring (20% Reduktion)
    const step1 = await this.executeRestructuring(asset, transform);
    totalEffect += step1;
    
    // Schritt 2: Debt Purchase (30% des Restbetrags)
    const adjustedAsset = { ...asset, nominal_amount: asset.nominal_amount + step1 };
    const step2 = await this.executeDebtPurchase(adjustedAsset, transform);
    totalEffect += step2;
    
    // Schritt 3: Netting (40% des Restbetrags)
    const furtherAdjustedAsset = { ...asset, nominal_amount: asset.nominal_amount + totalEffect };
    const step3 = await this.executeNetting(furtherAdjustedAsset, transform);
    totalEffect += step3;
    
    return totalEffect;
  }

  /**
   * Nullpunkt-Event loggen
   */
  async logNullpointEvent(negAssetId, nullpointStatus) {
    const eventId = crypto.randomUUID();
    
    await this.db.prepare(`
      INSERT INTO telbank_ledger (
        ledger_entry_id, neg_asset_id, entry_type,
        currency_code, amount, booked_at, description, created_at
      ) VALUES (?, ?, 'neutral', ?, ?, ?, ?, ?)
    `).bind(
      eventId,
      negAssetId,
      nullpointStatus.currencyCode,
      0, // Neutral-Eintrag für Nullpunkt-Erreichung
      new Date().toISOString(),
      `NULLPUNKT ERREICHT: Asset ${negAssetId} ist aus dem Dunkeln ins Licht (Residual: ${nullpointStatus.residualAmount})`,
      new Date().toISOString()
    ).run();

    // Event-Emit (für externe Systeme)
    return {
      eventId,
      type: 'nullpoint_reached',
      negAssetId,
      nullpointStatus
    };
  }

  /**
   * Automatische Transformation-Workflows
   */
  async triggerAutomaticWorkflows(bankId) {
    // Finde alle Assets, die automatische Transformation benötigen
    const assets = await this.db.prepare(`
      SELECT * FROM negative_asset
      WHERE provider_bank_id = ?
        AND status IN ('reported', 'validated')
        AND risk_score < 50  -- Niedrigeres Risiko → automatisch transformierbar
    `).bind(bankId).all();

    const results = [];

    for (const asset of assets.results) {
      try {
        // Erstelle automatische Transformation
        const transformId = crypto.randomUUID();
        const transform = await this.db.prepare(`
          INSERT INTO transformation_action (
            transform_id, neg_asset_id, action_type, description,
            scheduled_at, result_state, created_at
          ) VALUES (?, ?, 'transformation_workflow', ?, ?, 'planned', ?)
        `).bind(
          transformId,
          asset.neg_asset_id,
          `Automatic workflow for asset ${asset.neg_asset_id}`,
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          new Date().toISOString()
        ).run();

        // Führe Transformation aus
        const result = await this.executeTransformation(transformId);
        results.push(result);
      } catch (error) {
        console.error(`[TransformationEngine] Error in automatic workflow for asset ${asset.neg_asset_id}:`, error);
      }
    }

    return results;
  }

  /**
   * Batch-Transformation (mehrere Assets gleichzeitig)
   */
  async executeBatchTransformation(transformIds) {
    const results = [];

    for (const transformId of transformIds) {
      try {
        const result = await this.executeTransformation(transformId);
        results.push({ transformId, success: true, ...result });
      } catch (error) {
        results.push({ transformId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get Transformation Statistics
   */
  async getTransformationStats(bankId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_transformations,
        SUM(CASE WHEN result_state = 'executed' THEN 1 ELSE 0 END) as executed_count,
        SUM(CASE WHEN result_state = 'planned' THEN 1 ELSE 0 END) as planned_count,
        SUM(CASE WHEN result_state = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(effect_amount) as total_effect
      FROM transformation_action
    `;

    if (bankId) {
      query += ` 
        WHERE neg_asset_id IN (
          SELECT neg_asset_id FROM negative_asset WHERE provider_bank_id = ?
        )
      `;
    }

    const stats = await this.db.prepare(query).bind(bankId || []).first();

    // Nullpunkt-Statistiken
    const nullpointStats = await this.db.prepare(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN status = 'beyond_nullpoint' THEN 1 ELSE 0 END) as beyond_nullpoint_count,
        SUM(CASE WHEN status = 'improving' THEN 1 ELSE 0 END) as improving_count,
        SUM(residual_amount) as total_residual
      FROM negative_asset_nullpoint_status
      ${bankId ? 'WHERE provider_bank_id = ?' : ''}
    `).bind(bankId || []).first();

    return {
      transformations: stats,
      nullpoint: nullpointStats
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransformationEngineComplete;
} else {
  window.TransformationEngineComplete = TransformationEngineComplete;
}

