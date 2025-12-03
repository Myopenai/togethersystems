// Cloudflare Pages Function: GET /api/admin/dashboard
// Returns comprehensive production metrics for the dashboard

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function checkApiKey(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  try {
    // Load all events from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const eventsResult = await env.DB.prepare(
      'SELECT id, type, actor_id, subject_type, subject_id, meta, created_at FROM events WHERE created_at >= ? ORDER BY created_at DESC'
    )
      .bind(thirtyDaysAgo)
      .all();
    
    const events = (eventsResult.results || []).map((r) => ({
      id: r.id,
      type: r.type,
      actorId: r.actor_id,
      subjectType: r.subject_type,
      subjectId: r.subject_id,
      meta: r.meta ? JSON.parse(r.meta) : {},
      createdAt: r.created_at,
    }));

    // Calculate metrics
    const totalEvents = events.length;
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const events24h = events.filter(e => e.createdAt >= last24h);
    
    // Error events (types containing 'error', 'fail', 'cancel' with error reason)
    const errorEvents = events.filter(e => 
      e.type?.toLowerCase().includes('error') ||
      e.type?.toLowerCase().includes('fail') ||
      (e.type === 'voucher.cancel' && e.meta?.reason?.toLowerCase().includes('error'))
    );
    
    const errorCount = errorEvents.length;
    const errorRate = totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0;
    
    // Quality Score (100% - error rate)
    const qualityScore = Math.max(0, 100 - errorRate);
    
    // Production Readiness (based on multiple factors)
    const readinessFactors = {
      activity: Math.min(100, (events24h.length / 100) * 100), // 100 events/day = 100%
      quality: qualityScore,
      stability: Math.max(0, 100 - (errorRate * 2)), // Double weight on errors
    };
    const productionReadiness = (
      readinessFactors.activity * 0.3 +
      readinessFactors.quality * 0.4 +
      readinessFactors.stability * 0.3
    );
    
    // System Stability (uptime-like metric, based on absence of critical errors)
    const criticalErrors = events.filter(e => 
      e.type?.toLowerCase().includes('critical') ||
      e.type?.toLowerCase().includes('crash')
    );
    const systemStability = totalEvents > 0 
      ? Math.max(0, 100 - ((criticalErrors.length / totalEvents) * 100))
      : 100;
    
    // Production Timeline (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(day.setHours(0,0,0,0)).toISOString();
      const dayEnd = new Date(day.setHours(23,59,59,999)).toISOString();
      const dayEvents = events.filter(e => e.createdAt >= dayStart && e.createdAt <= dayEnd);
      timeline.push({
        date: day.toISOString().slice(0, 10),
        count: dayEvents.length,
      });
    }
    
    // Error Statistics
    const errorByType = {};
    errorEvents.forEach(e => {
      const type = e.type || 'unknown';
      errorByType[type] = (errorByType[type] || 0) + 1;
    });
    const topErrors = Object.entries(errorByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Fix Statistics (assuming fix events exist)
    const fixEvents = events.filter(e => 
      e.type?.toLowerCase().includes('fix') ||
      e.type?.toLowerCase().includes('resolve')
    );
    const fixRate = errorCount > 0 ? (fixEvents.length / errorCount) * 100 : 0;
    
    // Feature Maturity (group by feature/service type)
    const features = {};
    events.forEach(e => {
      const featureName = e.subjectType || e.type?.split('.')[0] || 'unknown';
      if (!features[featureName]) {
        features[featureName] = { events: 0, errors: 0 };
      }
      features[featureName].events++;
      if (errorEvents.includes(e)) {
        features[featureName].errors++;
      }
    });
    
    const featureMaturity = Object.entries(features).map(([name, stats]) => ({
      name,
      events: stats.events,
      errorRate: stats.events > 0 ? (stats.errors / stats.events) * 100 : 0,
    })).sort((a, b) => b.events - a.events);
    
    // Recent Events (last 20)
    const recentEvents = events.slice(0, 20);
    
    // Backup Health (placeholder - would need backup tracking)
    const backupHealth = {
      status: 'ok', // Would check actual backup status
      lastBackup: 'Vor 2 Stunden', // Placeholder
      backupFrequency: 85, // Placeholder percentage
    };
    
    return json(200, {
      ok: true,
      productionReadiness: Math.round(productionReadiness * 10) / 10,
      qualityScore: Math.round(qualityScore * 10) / 10,
      systemStability: Math.round(systemStability * 10) / 10,
      activityCount: events24h.length,
      productionTimeline: timeline,
      errorStats: {
        rate: Math.round(errorRate * 100) / 100,
        count: errorCount,
        total: totalEvents,
        topErrors,
      },
      fixStats: {
        rate: Math.round(fixRate * 10) / 10,
        fixesPerWeek: fixEvents.filter(e => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          return e.createdAt >= weekAgo;
        }).length,
        openErrors: Math.max(0, errorCount - fixEvents.length),
      },
      featureMaturity,
      recentEvents,
      backupHealth,
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}









