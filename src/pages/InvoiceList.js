import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../utils/storage';
import { formatPrice } from '../utils/pricing';
import { formatDate, formatInvoiceNumber } from '../utils/helpers';
import './InvoiceList.css';

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const all = getInvoices().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setInvoices(all);
  }, []);

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.paymentStatus === filter);

  return (
    <div className="invoice-list-page">
      <h2>All Invoices</h2>
      <div className="filter-row">
        {['all', 'unpaid', 'paid'].map((f) => (
          <button key={f} className={'filter-btn' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${invoices.length})` : `${f} (${invoices.filter((i) => i.paymentStatus === f).length})`}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="empty-msg">No invoices found.</p>
      ) : (
        filtered.map((inv) => (
          <div key={inv.id} className="inv-list-card" onClick={() => navigate(`/invoice/${inv.id}`)}>
            <div className="inv-list-top">
              <span className="inv-list-num">#{formatInvoiceNumber(inv.invoiceNumber, inv.originalItemCount, inv.addedItemCount)}</span>
              <span className={'payment-badge ' + inv.paymentStatus}>{inv.paymentStatus}</span>
              <span className="inv-list-total">{formatPrice(inv.finalTotal)}</span>
            </div>
            <div className="inv-list-mid">{inv.customerName} → {inv.recipientName}</div>
            <div className="inv-list-bot">
              <span>{inv.lineItems.length} item(s)</span>
              <span>{formatDate(inv.createdAt)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
