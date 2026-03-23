import React, { useState, useEffect } from 'react';
import { getCompanySettings, saveCompanySettings } from '../../utils/api';
import './Admin.css';

export default function ShipmentSettings() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanySettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateShip = (field, value) => {
    setSettings((p) => ({
      ...p,
      shipmentSettings: { ...p.shipmentSettings, [field]: value },
    }));
    setSaved(false);
  };

  const updateThreshold = (field, value) => {
    setSettings((p) => ({
      ...p,
      shipmentSettings: {
        ...p.shipmentSettings,
        moneyThresholds: { ...p.shipmentSettings.moneyThresholds, [field]: parseFloat(value) || 0 },
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    await saveCompanySettings(settings);
    setSaved(true);
  };

  if (loading || !settings) return <div className="admin-page"><p>Loading...</p></div>;

  const ship = settings.shipmentSettings;

  return (
    <div className="admin-page">
      <h2>Shipment Settings</h2>

      <h3>Capacity Tracking Method</h3>
      <div className="toggle-group">
        {['money', 'volume', 'weight'].map((t) => (
          <button key={t} className={ship.capacityType === t ? 'active' : ''} onClick={() => updateShip('capacityType', t)}>
            {t === 'money' ? '💰 Money' : t === 'volume' ? '📐 Volume' : '⚖️ Weight'}
          </button>
        ))}
      </div>

      <div className="admin-form">
        {ship.capacityType === 'money' && (
          <>
            <div className="form-group">
              <label>Minimum Threshold ($)</label>
              <input type="number" value={ship.moneyThresholds.min} onChange={(e) => updateThreshold('min', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Maximum Threshold ($)</label>
              <input type="number" value={ship.moneyThresholds.max} onChange={(e) => updateThreshold('max', e.target.value)} />
            </div>
            <p style={{ fontSize: 13, color: '#666' }}>Shipments are considered full between ${ship.moneyThresholds.min.toLocaleString()} - ${ship.moneyThresholds.max.toLocaleString()}</p>
          </>
        )}

        {ship.capacityType === 'volume' && (
          <div className="form-group">
            <label>Volume Capacity (cubic feet)</label>
            <input type="number" value={ship.volumeCapacity} onChange={(e) => updateShip('volumeCapacity', parseFloat(e.target.value) || 0)} />
            <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Standard 40ft container: ~2,390 cu ft</p>
          </div>
        )}

        {ship.capacityType === 'weight' && (
          <div className="form-group">
            <label>Weight Capacity (lbs)</label>
            <input type="number" value={ship.weightCapacity} onChange={(e) => updateShip('weightCapacity', parseFloat(e.target.value) || 0)} />
            <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Standard 40ft container: ~67,200 lbs</p>
          </div>
        )}

        <button className={'save-btn' + (saved ? ' success' : '')} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
