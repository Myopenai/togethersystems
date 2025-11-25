// Automatische Rechnungstellung
// PDF-Generator für Rechnungen

class InvoiceGenerator {
  constructor(apiBase = '/api') {
    this.apiBase = apiBase;
  }

  // Rechnung erstellen
  async createInvoice(invoiceData) {
    const invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      issuer_id: invoiceData.issuer_id || this.getCurrentUserId(),
      recipient_id: invoiceData.recipient_id,
      voucher_id: invoiceData.voucher_id || null,
      booking_id: invoiceData.booking_id || null,
      amount: invoiceData.amount || 0,
      currency: invoiceData.currency || 'EUR',
      tax_rate: invoiceData.tax_rate || 0,
      items: invoiceData.items || [],
      status: 'draft',
      due_date: invoiceData.due_date || null,
      invoice_number: this.generateInvoiceNumber(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Netto-Betrag berechnen
    const subtotal = invoice.items.reduce((sum, item) => 
      sum + (item.price * (item.quantity || 1)), 0
    );
    const tax = subtotal * (invoice.tax_rate / 100);
    invoice.subtotal = subtotal;
    invoice.tax = tax;
    invoice.total = subtotal + tax;

    try {
      // Rechnung speichern (API)
      if (this.apiBase && !location.hostname.includes('github.io')) {
        const response = await fetch(`${this.apiBase}/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoice),
        });

        if (response.ok) {
          const data = await response.json();
          invoice.id = data.data?.invoice?.id || invoice.id;
        }
      }

      // PDF generieren
      const pdfUrl = await this.generatePDF(invoice);
      invoice.pdf_url = pdfUrl;

      return invoice;
    } catch (err) {
      console.error('Rechnung erstellen Fehler:', err);
      throw err;
    }
  }

  // PDF generieren (Client-Side)
  async generatePDF(invoice) {
    // HTML-Template für Rechnung
    const html = this.generateInvoiceHTML(invoice);

    // PDF generieren mit jsPDF oder html2pdf
    if (window.html2pdf) {
      return await this.generatePDFWithHtml2Pdf(html, invoice);
    } else if (window.jspdf) {
      return await this.generatePDFWithJsPDF(invoice);
    } else {
      // Fallback: HTML-Download
      return this.downloadInvoiceHTML(html, invoice);
    }
  }

  // HTML-Template für Rechnung
  generateInvoiceHTML(invoice) {
    const date = new Date(invoice.created_at).toLocaleDateString('de-DE');
    const dueDate = invoice.due_date 
      ? new Date(invoice.due_date).toLocaleDateString('de-DE')
      : null;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rechnung ${invoice.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .invoice-number { font-size: 24px; font-weight: bold; }
    .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .items th { background-color: #f2f2f2; }
    .total { text-align: right; margin-top: 20px; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Rechnung</h1>
      <p>Rechnungsnummer: <span class="invoice-number">${invoice.invoice_number}</span></p>
      <p>Datum: ${date}</p>
      ${dueDate ? `<p>Fälligkeitsdatum: ${dueDate}</p>` : ''}
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Beschreibung</th>
        <th>Menge</th>
        <th>Preis</th>
        <th>Gesamt</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td>${escapeHtml(item.description || '')}</td>
          <td>${item.quantity || 1}</td>
          <td>${formatCurrency(item.price, invoice.currency)}</td>
          <td>${formatCurrency(item.price * (item.quantity || 1), invoice.currency)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total">
    <p>Zwischensumme: ${formatCurrency(invoice.subtotal, invoice.currency)}</p>
    ${invoice.tax_rate > 0 ? `<p>MwSt. (${invoice.tax_rate}%): ${formatCurrency(invoice.tax, invoice.currency)}</p>` : ''}
    <p><strong>Gesamt: ${formatCurrency(invoice.total, invoice.currency)}</strong></p>
  </div>

  <div class="footer">
    <p>Erstellt von TogetherSystems Portal</p>
  </div>
</body>
</html>
    `;
  }

  // PDF mit html2pdf generieren
  async generatePDFWithHtml2Pdf(html, invoice) {
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    const opt = {
      margin: 1,
      filename: `rechnung-${invoice.invoice_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    await html2pdf().set(opt).from(element).save();
    document.body.removeChild(element);

    return `rechnung-${invoice.invoice_number}.pdf`;
  }

  // PDF mit jsPDF generieren (Fallback)
  generatePDFWithJsPDF(invoice) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Rechnung', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Rechnungsnummer: ${invoice.invoice_number}`, 20, 30);
    doc.text(`Datum: ${new Date(invoice.created_at).toLocaleDateString('de-DE')}`, 20, 35);

    let y = 50;
    doc.text('Beschreibung', 20, y);
    doc.text('Menge', 80, y);
    doc.text('Preis', 120, y);
    doc.text('Gesamt', 160, y);
    y += 10;

    invoice.items.forEach(item => {
      doc.text(item.description || '', 20, y);
      doc.text(String(item.quantity || 1), 80, y);
      doc.text(formatCurrency(item.price, invoice.currency), 120, y);
      doc.text(formatCurrency(item.price * (item.quantity || 1), invoice.currency), 160, y);
      y += 10;
    });

    y += 10;
    doc.text(`Zwischensumme: ${formatCurrency(invoice.subtotal, invoice.currency)}`, 120, y);
    y += 10;
    if (invoice.tax_rate > 0) {
      doc.text(`MwSt. (${invoice.tax_rate}%): ${formatCurrency(invoice.tax, invoice.currency)}`, 120, y);
      y += 10;
    }
    doc.setFontSize(14);
    doc.text(`Gesamt: ${formatCurrency(invoice.total, invoice.currency)}`, 120, y);

    const filename = `rechnung-${invoice.invoice_number}.pdf`;
    doc.save(filename);
    
    return filename;
  }

  // HTML-Download (Fallback)
  downloadInvoiceHTML(html, invoice) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rechnung-${invoice.invoice_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return `rechnung-${invoice.invoice_number}.html`;
  }

  // Rechnungsnummer generieren
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `INV-${year}${month}-${random}`;
  }

  // Rechnung automatisch aus Voucher/Booking erstellen
  async createInvoiceFromVoucher(voucherId, bookingId = null) {
    try {
      // Voucher-Daten laden
      const voucherResponse = await fetch(`${this.apiBase}/voucher/vouchers/${voucherId}`);
      if (!voucherResponse.ok) throw new Error('Voucher nicht gefunden');
      
      const voucherData = await voucherResponse.json();
      const voucher = voucherData.data?.voucher;
      
      if (!voucher) throw new Error('Voucher-Daten nicht verfügbar');

      // Rechnung erstellen
      const invoice = await this.createInvoice({
        recipient_id: voucher.holder_uid,
        voucher_id: voucherId,
        booking_id: bookingId,
        amount: voucher.price_amount || 0,
        currency: voucher.price_currency || 'EUR',
        items: [{
          description: voucher.title || voucher.service_type,
          quantity: 1,
          price: voucher.price_amount || 0,
        }],
      });

      return invoice;
    } catch (err) {
      console.error('Rechnung aus Voucher erstellen Fehler:', err);
      throw err;
    }
  }

  // Helper
  getCurrentUserId() {
    try {
      return localStorage.getItem('mot_user_id_v1') || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function escapeHtml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Globale Instanz
const invoiceGenerator = new InvoiceGenerator();

// Export
if (typeof window !== 'undefined') {
  window.InvoiceGenerator = InvoiceGenerator;
  window.invoiceGenerator = invoiceGenerator;
}


