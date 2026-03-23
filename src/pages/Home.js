import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, getShipments } from '../utils/api';
import { formatInvoiceNumber } from '../utils/helpers';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getInvoices(), getShipments()])
      .then(([inv, ship]) => {
        setInvoices(inv);
        setShipments(ship.filter((s) => s.status === 'collecting'));
      })
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toLocaleDateString();
  const todayInvoices = invoices.filter(
    (inv) => new Date(inv.createdAt).toLocaleDateString() === todayStr
  );
  const unpaid = invoices.filter((i) => i.paymentStatus === 'unpaid').length;

  if (loading) return <div className="home-page"><p>Loading...</p></div>;

  return (
    <div className="home-page">
      <div className="home-hero">
        <h2>Driver Dashboard</h2>
        <p className="date-display">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>v2.1</p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <span className="stat-number">{todayInvoices.length}</span>
          <span className="stat-label">Today's Pickups</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{unpaid}</span>
          <span className="stat-label">Unpaid</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{shipments.length}</span>
          <span className="stat-label">Active Shipments</span>
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
            <div key={inv.id} className="invoice-card" onClick={() => navigate(`/invoice/${inv.id}`)}>
              <div className="invoice-card-header">
                <span className="invoice-num">
                  #{formatInvoiceNumber(inv.invoiceNumber, inv.originalItemCount, inv.addedItemCount)}
                </span>
                <span className={'payment-badge ' + inv.paymentStatus}>
                  {inv.paymentStatus}
                </span>
                <span className="invoice-total">${inv.finalTotal.toFixed(2)}</span>
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
