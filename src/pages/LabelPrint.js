import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Barcode from 'react-barcode';
import { getInvoice } from '../utils/storage';
import { formatItemCount, formatInvoiceNumber } from '../utils/helpers';
import './LabelPrint.css';

export default function LabelPrint() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    setInvoice(getInvoice(id));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) {
    return <div className="label-page"><p>Invoice not found.</p></div>;
  }

  const itemCountDisplay = formatItemCount(
    invoice.originalItemCount,
    invoice.addedItemCount
  );

  const displayNumber = formatInvoiceNumber(
    invoice.invoiceNumber,
    invoice.originalItemCount,
    invoice.addedItemCount
  );

  // Generate labels: one label per line item, quantity shown on label
  const labels = invoice.lineItems.map((item, idx) => ({
    invoiceNumber: invoice.invoiceNumber,
    displayNumber,
    itemIndex: idx + 1,
    quantity: item.quantity,
    dimensions: `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}"`,
    description: item.description,
    totalItemCount: itemCountDisplay,
  }));

  return (
    <div className="label-page">
      <div className="label-controls no-print">
        <h2>Print Labels</h2>
        <p className="label-info">
          Invoice #{displayNumber} — {labels.length} label(s) —{' '}
          {itemCountDisplay} items total
        </p>
        <button className="print-btn" onClick={handlePrint}>
          🖨️ Print Labels
        </button>
      </div>

      <div className="labels-container" ref={printRef}>
        {labels.map((label, idx) => (
          <div key={idx} className="label">
            <div className="label-invoice">Invoice #{label.displayNumber}</div>
            <div className="label-barcode">
              <Barcode
                value={String(label.invoiceNumber)}
                width={1.5}
                height={50}
                fontSize={12}
                margin={4}
              />
            </div>
            <div className="label-details">
              <span className="label-dims">{label.dimensions}</span>
              {label.description && (
                <span className="label-desc">{label.description}</span>
              )}
            </div>
            <div className="label-count">
              Item {label.itemIndex} — Qty: {label.quantity} — Total: {label.totalItemCount} items
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
