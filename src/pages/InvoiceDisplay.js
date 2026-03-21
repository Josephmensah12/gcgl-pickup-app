import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice } from '../utils/storage';
import { formatPrice } from '../utils/pricing';
import { formatDate, formatItemCount, formatInvoiceNumber } from '../utils/helpers';
import './InvoiceDisplay.css';

export default function InvoiceDisplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const inv = getInvoice(id);
    setInvoice(inv);
  }, [id]);

  if (!invoice) {
    return <div className="invoice-page"><p>Invoice not found.</p></div>;
  }

  const itemCountDisplay = formatItemCount(
    invoice.originalItemCount,
    invoice.addedItemCount
  );

  return (
    <div className="invoice-page">
      <div className="invoice-header-card">
        <div className="inv-number">Invoice #{formatInvoiceNumber(invoice.invoiceNumber, invoice.originalItemCount, invoice.addedItemCount)}</div>
        <div className="inv-date">{formatDate(invoice.createdAt)}</div>
        {invoice.lastEditedAt && (
          <div className="inv-edited">Edited: {formatDate(invoice.lastEditedAt)}</div>
        )}
      </div>

      <div className="section">
        <h3>Customer</h3>
        <div className="detail-card">
          <p className="detail-name">{invoice.customerName}</p>
          <p className="detail-line">{invoice.customerEmail}</p>
          <p className="detail-line">{invoice.customerPhone}</p>
          <p className="detail-line">{invoice.customerAddress}</p>
        </div>
      </div>

      <div className="section">
        <h3>Line Items</h3>
        {invoice.lineItems.map((item, idx) => (
          <div key={item.id} className="line-item-card">
            <div className="li-top">
              <span className="li-num">#{idx + 1}</span>
              <span className="li-dims">
                {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}"
              </span>
              <span className="li-qty">×{item.quantity}</span>
              <span className="li-price">
                {formatPrice(item.calculatedPrice * item.quantity)}
              </span>
            </div>
            {item.description && (
              <div className="li-desc">{item.description}</div>
            )}
            {item.photo && (
              <img src={item.photo} alt="Item" className="li-photo" />
            )}
          </div>
        ))}
      </div>

      <div className="invoice-summary">
        <div className="summary-row">
          <span>Total Items:</span>
          <span>{itemCountDisplay}</span>
        </div>
        <div className="summary-row total-row">
          <span>Total:</span>
          <span>{formatPrice(invoice.total)}</span>
        </div>
      </div>

      <div className="invoice-actions">
        <button
          className="action-btn primary"
          onClick={() => navigate(`/labels/${invoice.id}`)}
        >
          🏷️ Print Labels
        </button>
        <button
          className="action-btn secondary"
          onClick={() =>
            navigate(`/items/new?invoiceId=${invoice.id}`)
          }
        >
          + Add More Items
        </button>
        <button
          className="action-btn outline"
          onClick={() => navigate('/')}
        >
          Complete Pickup
        </button>
      </div>
    </div>
  );
}
