// Cloudflare Pages Function: GET /api/autofix/notify
// Server-Sent Events (SSE) für Live-Benachrichtigungen über automatische Fehlerkorrekturen

export async function onRequestGet(context) {
  const { request, env } = context;

  // SSE-Stream erstellen
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Initiale Verbindungsnachricht
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Autofix-Benachrichtigungen aktiv' })}\n\n`)
      );

      // Polling für neue Autofix-Events (alle 2 Sekunden)
      const interval = setInterval(async () => {
        try {
          const now = new Date();
          const since = new Date(now.getTime() - 5000).toISOString(); // Letzte 5 Sekunden

          const events = await env.DB.prepare(
            `SELECT id, type, actor_id, subject_type, subject_id, meta, created_at
             FROM events
             WHERE type = 'autofix.applied' AND created_at > ?
             ORDER BY created_at DESC
             LIMIT 10`
          )
            .bind(since)
            .all();

          for (const event of events.results || []) {
            const meta = JSON.parse(event.meta || '{}');
            const notification = {
              type: 'autofix',
              id: event.id,
              timestamp: event.created_at,
              fix: {
                type: meta.fixType,
                action: meta.action,
                params: meta.params,
                message: meta.message || 'Fehler automatisch korrigiert',
              },
              error: meta.error,
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)
            );
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`)
          );
        }
      }, 2000);

      // Cleanup bei Verbindungsabbruch
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

