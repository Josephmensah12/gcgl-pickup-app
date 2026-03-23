import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Barcode from 'react-barcode';
import { getInvoice } from '../utils/api';
import { formatItemCount, formatInvoiceNumber } from '../utils/helpers';
import './LabelPrint.css';

export default function LabelPrint() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoice(id)
      .then(setInvoice)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="label-page"><p>Loading...</p></div>;
  if (!invoice) return <div className="label-page"><p>Invoice not found.</p></div>;

  const displayNum = formatInvoiceNumber(invoice.invoiceNumber, invoice.originalItemCount, invoice.addedItemCount);
  const itemCountDisplay = formatItemCount(invoice.originalItemCount, invoice.addedItemCount);

  return (
    <div className="label-page">
      <div className="label-controls no-print">
        <h2>Print Labels</h2>
        <p className="label-info">Invoice #{displayNum} — {invoice.lineItems.length} label(s) — {itemCountDisplay} items total</p>
        <button className="print-btn" onClick={() => window.print()}>🖨️ Print Labels</button>
      </div>

      <div className="labels-container">
        {invoice.lineItems.map((item, idx) => (
          <div key={item.id} className="label">
            <div className="label-invoice">Invoice #{displayNum}</div>
            <div className="label-barcode">
              <Barcode value={String(invoice.invoiceNumber)} width={1.5} height={50} fontSize={12} margin={4} />
            </div>
            <div className="label-recipient">
              <strong>To:</strong> {invoice.recipientName}<br />
              {invoice.recipientPhone}<br />
              {invoice.recipientAddress}
            </div>
            <div className="label-details">
              <span className="label-dims">
                {item.type === 'custom' ? `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}"` : item.catalogName}
              </span>
            </div>
            <div className="label-count">
              Item {idx + 1} — Qty: {item.quantity} — Total: {itemCountDisplay} items
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
