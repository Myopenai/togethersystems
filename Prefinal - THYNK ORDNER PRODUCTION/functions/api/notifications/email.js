// THYNK ORDNER - Email Notifications
// POST /api/notifications/email - Send email notification

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function checkApiKey(request, env) {
  const required = env?.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

// POST /api/notifications/email
export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { to, subject, template, data, order_id } = body;

  if (!to || !subject) {
    return json(400, { ok: false, error: 'to and subject required' });
  }

  try {
    // Email service configuration (SendGrid example)
    const emailApiKey = env?.SENDGRID_API_KEY;
    const fromEmail = env?.FROM_EMAIL || 'noreply@togethersystems.com';

    if (!emailApiKey) {
      // Development mode: Just log the email
      console.log('📧 Email (Development Mode):', {
        to,
        subject,
        template,
        data,
      });

      return json(200, {
        ok: true,
        data: {
          message: 'email logged (development mode - no API key configured)',
          to,
          subject,
        },
      });
    }

    // Generate email HTML based on template
    let htmlContent = '';
    if (template === 'order-confirmation') {
      htmlContent = generateOrderConfirmationEmail(data, order_id);
    } else if (template === 'order-status-update') {
      htmlContent = generateStatusUpdateEmail(data, order_id);
    } else {
      htmlContent = data?.html || data?.message || 'No content';
    }

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emailApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (!sendGridResponse.ok) {
      const error = await sendGridResponse.text();
      return json(500, { ok: false, error: 'email sending failed: ' + error });
    }

    return json(200, {
      ok: true,
      data: {
        message: 'email sent successfully',
        to,
        subject,
      },
    });
  } catch (err) {
    console.error('Error sending email:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

function generateOrderConfirmationEmail(data, orderId) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bestelling Bevestigd</h1>
        </div>
        <div class="content">
            <p>Beste ${data?.customer_name || 'Klant'},</p>
            <p>Bedankt voor uw bestelling!</p>
            <div class="order-details">
                <h2>Bestelgegevens</h2>
                <p><strong>Bestelnummer:</strong> ${data?.order_number || orderId}</p>
                <p><strong>Totaalbedrag:</strong> €${data?.total_amount || '0.00'}</p>
                <p><strong>Status:</strong> ${data?.status || 'pending'}</p>
            </div>
            <p>U ontvangt binnenkort een update over de status van uw bestelling.</p>
        </div>
        <div class="footer">
            <p>Together Systems - THYNK ORDNER</p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateStatusUpdateEmail(data, orderId) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .status { background: #e8f5e9; padding: 15px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bestelling Status Update</h1>
        </div>
        <div class="content">
            <p>Beste ${data?.customer_name || 'Klant'},</p>
            <div class="status">
                <h2>Nieuwe Status: ${data?.status || 'Unknown'}</h2>
                <p><strong>Bestelnummer:</strong> ${data?.order_number || orderId}</p>
                ${data?.message ? `<p>${data.message}</p>` : ''}
            </div>
        </div>
        <div class="footer">
            <p>Together Systems - THYNK ORDNER</p>
        </div>
    </div>
</body>
</html>
  `;
}

