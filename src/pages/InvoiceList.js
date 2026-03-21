import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../utils/storage';
import { formatPrice } from '../utils/pricing';
import { formatDate, formatInvoiceNumber } from '../utils/helpers';
import './InvoiceList.css';

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const all = getInvoices().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setInvoices(all);
  }, []);

  return (
    <div className="invoice-list-page">
      <h2>All Invoices</h2>
      {invoices.length === 0 ? (
        <p className="empty-msg">No invoices yet.</p>
      ) : (
        invoices.map((inv) => (
          <div
            key={inv.id}
            className="inv-list-card"
            onClick={() => navigate(`/invoice/${inv.id}`)}
          >
            <div className="inv-list-top">
              <span className="inv-list-num">#{formatInvoiceNumber(inv.invoiceNumber, inv.originalItemCount, inv.addedItemCount)}</span>
              <span className="inv-list-total">{formatPrice(inv.total)}</span>
            </div>
            <div className="inv-list-mid">{inv.customerName}</div>
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
