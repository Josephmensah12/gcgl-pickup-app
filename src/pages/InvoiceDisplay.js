import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, getCompanySettings } from '../utils/storage';
import { formatPrice } from '../utils/pricing';
import { formatDate, formatItemCount, formatInvoiceNumber } from '../utils/helpers';
import './InvoiceDisplay.css';

export default function InvoiceDisplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [showEmail, setShowEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const settings = getCompanySettings();

  useEffect(() => {
    setInvoice(getInvoice(id));
  }, [id]);

  if (!invoice) return <div className="invoice-page"><p>Invoice not found.</p></div>;

  const displayNum = formatInvoiceNumber(invoice.invoiceNumber, invoice.originalItemCount, invoice.addedItemCount);
  const itemCountDisplay = formatItemCount(invoice.originalItemCount, invoice.addedItemCount);

  const sendEmail = () => {
    alert(`Invoice email would be sent to ${invoice.customerEmail}\n\nThis feature will use an email service in Phase 2.`);
    setShowEmail(false);
  };

  return (
    <div className="invoice-page">
      {/* Header */}
      <div className="invoice-header-card">
        <div className="company-name">{settings.companyInfo.name}</div>
        <div className="inv-number">Invoice #{displayNum}</div>
        <div className="inv-date">{formatDate(invoice.createdAt)}</div>
        {invoice.lastEditedAt && <div className="inv-edited">Edited: {formatDate(invoice.lastEditedAt)}</div>}
        <span className={'payment-badge-lg ' + invoice.paymentStatus}>{invoice.paymentStatus}</span>
      </div>

      {/* Customer & Recipient */}
      <div className="inv-parties">
        <div className="party">
          <h4>From (Sender)</h4>
          <p className="party-name">{invoice.customerName}</p>
          <p>{invoice.customerPhone}</p>
          <p>{invoice.customerEmail}</p>
          <p>{invoice.customerAddress}</p>
        </div>
        <div className="party">
          <h4>Ship To (Recipient)</h4>
          <p className="party-name">{invoice.recipientName}</p>
          <p>{invoice.recipientPhone}</p>
          <p>{invoice.recipientAddress}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="section">
        <h3>Line Items</h3>
        {invoice.lineItems.map((item, idx) => (
          <div key={item.id} className="line-item-card">
            <div className="li-top">
              <span className="li-num">#{idx + 1}</span>
              <span className="li-type">{item.type === 'custom' ? `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}"` : item.catalogName}</span>
              <span className="li-qty">×{item.quantity}</span>
              <span className="li-price">{formatPrice(item.finalPrice * item.quantity)}</span>
            </div>
            {item.discount && (
              <div className="li-discount">
                Discount: {item.discount.type === 'percentage' ? `${item.discount.amount}%` : `$${item.discount.amount}`}
                {' '}(was {formatPrice(item.basePrice)}/ea)
              </div>
            )}
            {item.description && <div className="li-desc">{item.description}</div>}
            {item.photos && item.photos.length > 0 && (
              <div className="li-photos">{item.photos.map((p, i) => <img key={i} src={p} alt="" className="li-photo" />)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="invoice-summary">
        <div className="summary-row"><span>Subtotal:</span><span>{formatPrice(invoice.subtotal)}</span></div>
        {invoice.totalDiscount > 0 && (
          <div className="summary-row discount"><span>Discounts:</span><span>-{formatPrice(invoice.totalDiscount)}</span></div>
        )}
        <div className="summary-row"><span>Total Items:</span><span>{itemCountDisplay}</span></div>
        <div className="summary-row total-row"><span>Total:</span><span>{formatPrice(invoice.finalTotal)}</span></div>
        {invoice.paymentStatus === 'paid' && (
          <div className="summary-row paid-info">
            <span>Paid ({invoice.paymentMethod}):</span>
            <span>{formatPrice(invoice.amountPaid)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="invoice-actions">
        <button className="action-btn primary" onClick={() => navigate(`/labels/${invoice.id}`)}>🏷️ Print Labels</button>
        <button className="action-btn email-btn" onClick={() => setShowEmail(true)}>📧 Email Invoice</button>
        <button className="action-btn secondary" onClick={() => navigate(`/pickup/edit/${invoice.id}`)}>+ Add More Items</button>
        <button className="action-btn outline" onClick={() => navigate('/')}>Complete Pickup</button>
      </div>

      {/* Email Modal */}
      {showEmail && (
        <div className="modal-overlay" onClick={() => setShowEmail(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Email Invoice</h3>
            <p className="modal-info">To: {invoice.customerEmail}</p>
            <textarea placeholder="Optional message to customer..." value={emailMsg} onChange={(e) => setEmailMsg(e.target.value)} rows={3} />
            <div className="modal-actions">
              <button className="modal-send" onClick={sendEmail}>Send Invoice</button>
              <button className="modal-cancel" onClick={() => setShowEmail(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
