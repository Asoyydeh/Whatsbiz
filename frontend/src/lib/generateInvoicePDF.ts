import type { Invoice } from '@/components/invoices/InvoiceRow';

/**
 * Generate and download a PDF invoice using jsPDF.
 * Uses dynamic import so the heavy PDF library only loads when needed.
 */
export async function downloadInvoicePDF(invoice: Invoice): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const customer = invoice.order.customer;
  const pageW = 210;
  const margin = 20;

  // ─── Header ───────────────────────────────────────────────────
  // Left: Company branding
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('WhatsBiz CRM', margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('WhatsApp CRM untuk UMKM Indonesia', margin, 25);
  doc.text('whatsbiz.id  |  support@whatsbiz.id', margin, 31);

  // Right: INVOICE label
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageW - margin, 18, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoice.invoice_number}`, pageW - margin, 26, { align: 'right' });

  // ─── Invoice Meta ──────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);

  const metaY = 52;
  // Left: Bill To
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('TAGIHAN KEPADA', margin, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.text(customer.name, margin, metaY + 7);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(customer.phone, margin, metaY + 13);

  // Right: Invoice details
  const detailsX = 130;
  const detailsData = [
    ['Tanggal Invoice:', new Date(invoice.created_at).toLocaleDateString('id-ID')],
    [
      'Jatuh Tempo:',
      invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '—',
    ],
    ['No. Pesanan:', `#${invoice.order.order_number}`],
    ['Status:', getStatusLabel(invoice.status)],
  ];

  detailsData.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label, detailsX, metaY + i * 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, pageW - margin, metaY + i * 7, { align: 'right' });
  });

  // ─── Line Items Table ──────────────────────────────────────────
  const tableY = metaY + 38;

  autoTable(doc, {
    startY: tableY,
    margin: { left: margin, right: margin },
    head: [['#', 'Nama Produk / Layanan', 'Qty', 'Harga Satuan', 'Subtotal']],
    body: invoice.order.order_items.map((item, idx) => [
      String(idx + 1),
      item.name,
      String(item.quantity),
      `Rp ${item.price.toLocaleString('id-ID')}`,
      `Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`,
    ]),
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [245, 255, 250] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  // ─── Totals ────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totalsX = pageW - margin - 70;

  let rowY = 0;
  const addRow = (label: string, value: string, bold = false, color?: [number, number, number]) => {
    if (bold) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
    }
    doc.setTextColor(...(color || [80, 80, 80]));
    doc.text(label, totalsX, finalY + rowY);
    doc.text(value, pageW - margin, finalY + rowY, { align: 'right' });
    rowY += bold ? 8 : 6;
  };

  addRow('Subtotal:', `Rp ${invoice.order.subtotal.toLocaleString('id-ID')}`);
  if (invoice.order.discount > 0) {
    addRow('Diskon:', `-Rp ${invoice.order.discount.toLocaleString('id-ID')}`, false, [200, 50, 50]);
  }
  if (invoice.order.tax > 0) {
    addRow('Pajak:', `Rp ${invoice.order.tax.toLocaleString('id-ID')}`);
  }

  // Separator line
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(totalsX, finalY + rowY, pageW - margin, finalY + rowY);
  rowY += 4;

  addRow('TOTAL:', `Rp ${invoice.total.toLocaleString('id-ID')}`, true, [16, 100, 70]);

  if (invoice.paid_amount > 0) {
    rowY += 2;
    addRow('Dibayar:', `Rp ${invoice.paid_amount.toLocaleString('id-ID')}`, false, [16, 130, 80]);
    addRow(
      'Sisa Tagihan:',
      `Rp ${(invoice.total - invoice.paid_amount).toLocaleString('id-ID')}`,
      true,
      [200, 50, 50],
    );
  }

  // ─── Footer ───────────────────────────────────────────────────
  const footerY = 270;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Terima kasih telah berbelanja! Silakan hubungi kami jika ada pertanyaan.', pageW / 2, footerY, {
    align: 'center',
  });
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 278, pageW, 2, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(7);
  doc.text('Dibuat oleh WhatsBiz CRM • whatsbiz.id', pageW / 2, 283, { align: 'center' });

  // ─── Save ──────────────────────────────────────────────────────
  doc.save(`${invoice.invoice_number}.pdf`);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    SENT: 'Terkirim',
    PARTIALLY_PAID: 'Bayar Sebagian',
    PAID: 'Lunas',
    OVERDUE: 'Jatuh Tempo',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
}
