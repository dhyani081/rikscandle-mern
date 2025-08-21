// server/src/utils/invoice.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const money = (n) => '₹' + Number(n || 0).toFixed(2);

// Palette
const COLOR_PRIMARY = '#92400e';  // amber-800
const COLOR_ACCENT  = '#b45309';  // amber-700
const COLOR_TEXT    = '#111827';  // gray-900
const COLOR_MUTED   = '#6b7280';  // gray-500
const COLOR_LINE    = '#e5e7eb';  // gray-200

const MARGIN = 40;
const HEADER_H = 70;

// Logo sizing (can tweak via .env)
const LOGO_W = Number(process.env.INVOICE_LOGO_BOX_W || 64);
const LOGO_H = Number(process.env.INVOICE_LOGO_H || 48);

// --- helpers ---
function fetchBuffer(urlStr) {
  return new Promise((resolve, reject) => {
    const getter = urlStr.startsWith('https') ? https : http;
    getter.get(urlStr, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}
async function loadLogo() {
  const url = process.env.COMPANY_LOGO_URL;
  const file = process.env.COMPANY_LOGO_PATH;
  try {
    if (url && /^https?:\/\//.test(url) && !url.toLowerCase().endsWith('.svg')) return await fetchBuffer(url);
    if (file) {
      const p = path.resolve(file);
      if (!p.toLowerCase().endsWith('.svg')) return await fs.promises.readFile(p);
    }
  } catch (e) { console.warn('Invoice: logo load failed:', e?.message || e); }
  return null;
}
function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
function resolveFont(env, fallback) {
  const p = process.env[env] ? path.resolve(process.env[env]) : fallback;
  return p && exists(p) ? p : null;
}

export async function buildInvoiceBuffer(order) {
  const company = {
    name: process.env.COMPANY_NAME || 'RiksCandle',
    address: process.env.COMPANY_ADDRESS || '',
  };
  const logoBuf = await loadLogo();

  // fonts for ₹
  const reg = resolveFont('INVOICE_FONT_REG', path.resolve('src/assets/fonts/NotoSans-Regular.ttf'));
  const bold = resolveFont('INVOICE_FONT_BOLD', path.resolve('src/assets/fonts/NotoSans-Bold.ttf'));

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const F = { reg: 'Helvetica', bold: 'Helvetica-Bold' };
    try {
      if (reg && bold) {
        doc.registerFont('RC-Reg', reg);
        doc.registerFont('RC-Bold', bold);
        F.reg = 'RC-Reg'; F.bold = 'RC-Bold';
      }
    } catch {}

    const pageW = doc.page.width;
    const contentW = pageW - MARGIN * 2;

    /** === HEADER (logo + brand left, meta right) === */
    const hY = MARGIN - 6;
    let textX = MARGIN;

    if (logoBuf) {
      try {
        doc.image(logoBuf, MARGIN, hY + (HEADER_H - LOGO_H) / 2, { fit: [LOGO_W, LOGO_H] });
        textX = MARGIN + LOGO_W + 12;
      } catch {}
    }

    doc.font(F.bold).fontSize(20).fillColor(COLOR_PRIMARY)
      .text(company.name, textX, hY + 8, { width: contentW * 0.55 });
    if (company.address) {
      doc.font(F.reg).fontSize(10).fillColor(COLOR_MUTED)
        .text(company.address, textX, hY + 34, { width: contentW * 0.55 });
    }

    // Right meta (no boxes)
    const metaX = MARGIN + contentW * 0.58;
    const oid = String(order._id).slice(-6);
    doc.font(F.bold).fontSize(12).fillColor(COLOR_TEXT)
      .text('Invoice', metaX, hY + 6, { align: 'right', width: contentW * 0.42 });
    doc.font(F.reg).fontSize(10)
      .text(`Invoice #: ${oid}`, metaX, hY + 24, { align: 'right', width: contentW * 0.42 })
      .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, metaX, hY + 38, { align: 'right', width: contentW * 0.42 })
      .text(`Payment: ${order.paymentMethod || ''} ${order.isPaid ? '(Paid)' : ''}`, metaX, hY + 52, { align: 'right', width: contentW * 0.42 });

    // divider
    doc.moveTo(MARGIN, hY + HEADER_H).lineTo(MARGIN + contentW, hY + HEADER_H)
      .lineWidth(1).strokeColor(COLOR_LINE).stroke();

    /** === BILL TO === */
    const c = order.contact || {};
    const a = order.shippingAddress || {};
    const t = order.totals || {};

    let y = hY + HEADER_H + 16;
    doc.font(F.bold).fontSize(12).fillColor(COLOR_TEXT).text('Bill To', MARGIN, y);
    y += 16;
    doc.font(F.reg).fontSize(11).fillColor(COLOR_TEXT).text(c.name || '', MARGIN, y);
    y += 14;
    if (c.email) { doc.fillColor(COLOR_MUTED).fontSize(10).text(`Email: ${c.email}`, MARGIN, y); y += 12; }
    if (c.phone) { doc.fillColor(COLOR_MUTED).fontSize(10).text(`Phone: ${c.phone}`, MARGIN, y); y += 12; }
    const addr = [a.address, a.city, a.state, a.pin].filter(Boolean).join(', ');
    if (addr) { doc.fillColor(COLOR_TEXT).fontSize(10).text(addr, MARGIN, y, { width: 280 }); }

    /** === ITEMS TABLE === */
    const tableTop = y + 32;
    const col = {
      name: MARGIN + 8,
      qty:  MARGIN + contentW - 210,
      price:MARGIN + contentW - 140,
      total:MARGIN + contentW - 70
    };

    // header row
    doc.rect(MARGIN, tableTop, contentW, 22).fill('#f3f4f6');
    doc.strokeColor(COLOR_LINE).lineWidth(1).rect(MARGIN, tableTop, contentW, 22).stroke();
    doc.fillColor(COLOR_TEXT).font(F.bold).fontSize(10);
    doc.text('Product', col.name, tableTop + 6, { width: col.qty - col.name - 8 });
    doc.text('Qty',     col.qty,   tableTop + 6, { width: 40, align: 'right' });
    doc.text('Price',   col.price, tableTop + 6, { width: 60, align: 'right' });
    doc.text('Total',   col.total, tableTop + 6, { width: 60, align: 'right' });

    let yPos = tableTop + 22;
    (order.items || []).forEach((it, idx) => {
      yPos += 1;
      doc.moveTo(MARGIN, yPos).lineTo(MARGIN + contentW, yPos).strokeColor(COLOR_LINE).stroke();
      yPos += 5;

      const lineTotal = Number(it.price || 0) * Number(it.qty || 0);
      doc.font(F.reg).fontSize(10).fillColor(COLOR_TEXT);
      doc.text(String(it.name || ''), col.name, yPos, { width: col.qty - col.name - 8 });
      doc.text(String(it.qty || 0),   col.qty,   yPos, { width: 40, align: 'right' });
      doc.text(money(it.price),       col.price, yPos, { width: 60, align: 'right' });
      doc.text(money(lineTotal),      col.total, yPos, { width: 60, align: 'right' });

      yPos += 18;
    });

    /** === TOTALS (right aligned, no box) === */
    yPos += 6;
    doc.moveTo(MARGIN + contentW - 220, yPos).lineTo(MARGIN + contentW, yPos).strokeColor(COLOR_LINE).stroke();
    yPos += 6;

    const labelX = MARGIN + contentW - 220;
    const valX = MARGIN + contentW - 90;

    function totalRow(label, value, boldRow=false) {
      doc.font(boldRow ? F.bold : F.reg).fontSize(10).fillColor(COLOR_TEXT);
      doc.text(label, labelX, yPos, { width: 120, align: 'right' });
      doc.text(money(value), valX, yPos, { width: 90, align: 'right' });
      yPos += 16;
    }
    totalRow('Subtotal', t.subTotal || 0);
    totalRow('Shipping', t.shipping || 0);
    totalRow('Tax',      t.tax || 0);
    doc.moveTo(MARGIN + contentW - 220, yPos).lineTo(MARGIN + contentW, yPos).strokeColor(COLOR_LINE).stroke();
    yPos += 8;
    totalRow('Grand Total', t.grandTotal || 0, true);

    // Footer
    yPos += 14;
    doc.font(F.reg).fontSize(9).fillColor(COLOR_MUTED)
       .text('Thank you for shopping with us!', MARGIN, yPos);

    doc.end();
  });
}
