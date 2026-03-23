import React, { useState } from 'react';
import { getShipments, saveShipment, getCompanySettings, getInvoices } from '../../utils/storage';
import { generateId, generateShipmentName } from '../../utils/helpers';
import { formatPrice } from '../../utils/pricing';
import './Admin.css';

export default function ShipmentList() {
  const [shipments, setShipments] = useState(getShipments());
  const settings = getCompanySettings();
  const invoices = getInvoices();

  const refresh = () => setShipments(getShipments());

  const createShipment = () => {
    const shipment = {
      id: generateId(),
      name: generateShipmentName(),
      status: 'collecting',
      invoiceIds: [],
      totalValue: 0,
      totalVolume: 0,
      totalWeight: 0,
      capacityType: settings.shipmentSettings.capacityType,
      createdAt: new Date().toISOString(),
      shippedAt: null,
    };
    saveShipment(shipment);
    refresh();
  };

  const updateStatus = (shipment, status) => {
    saveShipment({ ...shipment, status, shippedAt: status === 'shipped' ? new Date().toISOString() : null });
    refresh();
  };

  const getCapacity = (shipment) => {
    // Calculate from assigned invoices
    const assigned = invoices.filter((i) => i.shipmentId === shipment.id);
    const totalValue = assigned.reduce((s, i) => s + i.finalTotal, 0);
    const ss = settings.shipmentSettings;

    if (ss.capacityType === 'money') {
      const pct = Math.min(100, (totalValue / ss.moneyThresholds.max) * 100);
      return { pct, label: `${formatPrice(totalValue)} / ${formatPrice(ss.moneyThresholds.max)}`, value: totalValue };
    }
    return { pct: 0, label: 'N/A', value: 0 };
  };

  return (
    <div className="admin-page">
      <h2>Shipments</h2>
      <button className="add-btn" onClick={createShipment}>+ New Shipment</button>

      {shipments.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No shipments yet.</p>}

      {shipments.map((s) => {
        const cap = getCapacity(s);
        const assigned = invoices.filter((i) => i.shipmentId === s.id);
        const color = cap.pct >= 90 ? 'red' : cap.pct >= 70 ? 'yellow' : 'green';

        return (
          <div key={s.id} className="shipment-card">
            <div className="shipment-header">
              <span className="shipment-name">{s.name}</span>
              <span className={'shipment-status ' + s.status}>{s.status}</span>
            </div>
            <div style={{ fontSize: 13, color: '#666', margin: '6px 0' }}>
              {assigned.length} invoice(s) assigned
            </div>
            <div className="capacity-bar">
              <div className="capacity-bar-label">
                <span>Capacity</span>
                <span>{cap.label}</span>
              </div>
              <div className="capacity-track">
                <div className={`capacity-fill ${color}`} style={{ width: `${cap.pct}%` }} />
              </div>
            </div>
            {s.status === 'collecting' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="icon-btn edit" style={{ flex: 1, fontSize: 13, width: 'auto' }} onClick={() => updateStatus(s, 'full')}>Mark Full</button>
                <button className="icon-btn edit" style={{ flex: 1, fontSize: 13, width: 'auto', background: '#dcfce7', color: '#15803d' }} onClick={() => updateStatus(s, 'shipped')}>Mark Shipped</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
