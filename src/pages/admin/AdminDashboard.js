import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanySettings, getInvoices, getShipments, getCatalogItems } from '../../utils/storage';
import './Admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const settings = getCompanySettings();
  const invoices = getInvoices();
  const shipments = getShipments();
  const catalog = getCatalogItems();

  const cards = [
    { label: 'Company Settings', icon: '🏢', path: '/admin/settings', sub: settings.companyInfo.name },
    { label: 'Payment Methods', icon: '💳', path: '/admin/payments', sub: 'Configure payment options' },
    { label: 'Item Catalog', icon: '📦', path: '/admin/catalog', sub: `${catalog.filter((c) => c.active).length} active items` },
    { label: 'Shipment Settings', icon: '🚢', path: '/admin/shipments', sub: `Tracking by ${settings.shipmentSettings.capacityType}` },
    { label: 'Active Shipments', icon: '📊', path: '/admin/shipments/list', sub: `${shipments.filter((s) => s.status === 'collecting').length} collecting` },
    { label: 'Policies & Terms', icon: '📋', path: '/admin/policies', sub: `${settings.policies.prohibited.length} prohibited items` },
  ];

  return (
    <div className="admin-page">
      <h2>Admin Portal</h2>
      <div className="admin-stats">
        <div className="admin-stat"><span className="admin-stat-num">{invoices.length}</span><span>Invoices</span></div>
        <div className="admin-stat"><span className="admin-stat-num">{invoices.filter((i) => i.paymentStatus === 'unpaid').length}</span><span>Unpaid</span></div>
        <div className="admin-stat"><span className="admin-stat-num">{shipments.length}</span><span>Shipments</span></div>
      </div>
      <div className="admin-grid">
        {cards.map((c) => (
          <div key={c.path} className="admin-card" onClick={() => navigate(c.path)}>
            <span className="admin-card-icon">{c.icon}</span>
            <span className="admin-card-label">{c.label}</span>
            <span className="admin-card-sub">{c.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
