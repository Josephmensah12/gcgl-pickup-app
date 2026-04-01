import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, getShipments } from '../utils/api';
import { formatPrice } from '../utils/pricing';
import { formatDate, formatInvoiceNumber } from '../utils/helpers';
import './InvoiceList.css';

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [activeShipmentId, setActiveShipmentId] = useState(null);
  const [shipmentFilter, setShipmentFilter] = useState('active');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getInvoices(), getShipments()])
      .then(([allInvoices, allShipments]) => {
        setInvoices(allInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        const sorted = allShipments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setShipments(sorted);
        const active = sorted.find((s) => s.status === 'collecting');
        if (active) {
          setActiveShipmentId(active.id);
          setShipmentFilter(active.id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const byShipment = shipmentFilter === 'all'
    ? invoices
    : invoices.filter((i) => i.shipmentId === shipmentFilter);

  const filtered = paymentFilter === 'all'
    ? byShipment
    : byShipment.filter((i) => i.paymentStatus === paymentFilter);

  if (loading) return <div className="invoice-list-page"><p>Loading...</p></div>;

  return (
    <div className="invoice-list-page">
      <h2>Invoices</h2>

      {/* Shipment filter */}
      <div className="shipment-filter">
        <select
          value={shipmentFilter}
          onChange={(e) => setShipmentFilter(e.target.value)}
          className="shipment-select"
        >
          {shipments.filter((s) => s.status === 'collecting').map((s) => (
            <option key={s.id} value={s.id}>{s.name} (Active)</option>
          ))}
          <option value="all">All Shipments ({invoices.length})</option>
          {shipments.filter((s) => s.status !== 'collecting').map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Payment filter */}
      <div className="filter-row">
        {['all', 'unpaid', 'paid'].map((f) => (
          <button key={f} className={'filter-btn' + (paymentFilter === f ? ' active' : '')} onClick={() => setPaymentFilter(f)}>
            {f === 'all' ? `All (${byShipment.length})` : `${f} (${byShipment.filter((i) => i.paymentStatus === f).length})`}
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
