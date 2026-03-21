import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../utils/storage';
import { formatInvoiceNumber } from '../utils/helpers';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const invoices = getInvoices();
  const todayStr = new Date().toLocaleDateString();
  const todayInvoices = invoices.filter(
    (inv) => new Date(inv.createdAt).toLocaleDateString() === todayStr
  );

  return (
    <div className="home-page">
      <div className="home-hero">
        <h2>Driver Dashboard</h2>
        <p className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <span className="stat-number">{todayInvoices.length}</span>
          <span className="stat-label">Today's Pickups</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{invoices.length}</span>
          <span className="stat-label">Total Invoices</span>
        </div>
      </div>

      <div className="home-actions">
        <button className="action-btn primary" onClick={() => navigate('/customers')}>
          <span className="action-icon">👤</span>
          <span>New Pickup</span>
        </button>
        <button className="action-btn secondary" onClick={() => navigate('/invoices')}>
          <span className="action-icon">📋</span>
          <span>View Invoices</span>
        </button>
      </div>

      {todayInvoices.length > 0 && (
        <div className="recent-section">
          <h3>Today's Invoices</h3>
          {todayInvoices.map((inv) => (
            <div
              key={inv.id}
              className="invoice-card"
              onClick={() => navigate(`/invoice/${inv.id}`)}
            >
              <div className="invoice-card-header">
                <span className="invoice-num">#{formatInvoiceNumber(inv.invoiceNumber, inv.originalItemCount, inv.addedItemCount)}</span>
                <span className="invoice-total">${inv.total.toFixed(2)}</span>
              </div>
              <div className="invoice-card-sub">
                {inv.customerName} — {inv.lineItems.length} item(s)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
