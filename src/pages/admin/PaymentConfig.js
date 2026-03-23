import React, { useState } from 'react';
import { getCompanySettings, saveCompanySettings } from '../../utils/storage';
import './Admin.css';

export default function PaymentConfig() {
  const [settings, setSettings] = useState(getCompanySettings());
  const [saved, setSaved] = useState(false);
  const methods = settings.paymentMethods;

  const toggle = (method) => {
    setSettings((p) => ({
      ...p,
      paymentMethods: {
        ...p.paymentMethods,
        [method]: { ...p.paymentMethods[method], enabled: !p.paymentMethods[method].enabled },
      },
    }));
    setSaved(false);
  };

  const updateInstructions = (method, value) => {
    setSettings((p) => ({
      ...p,
      paymentMethods: {
        ...p.paymentMethods,
        [method]: { ...p.paymentMethods[method], instructions: value },
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveCompanySettings(settings);
    setSaved(true);
  };

  const methodLabels = { square: 'Square', zelle: 'Zelle', cash: 'Cash', check: 'Check' };

  return (
    <div className="admin-page">
      <h2>Payment Methods</h2>

      {Object.entries(methods).map(([key, config]) => (
        <div key={key} className="payment-method">
          <div className="payment-header">
            <span className="payment-name">{methodLabels[key]}</span>
            <button className={'toggle-switch ' + (config.enabled ? 'on' : 'off')} onClick={() => toggle(key)} />
          </div>
          {config.enabled && (
            <div className="admin-form" style={{ marginTop: 8 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Instructions for Customers</label>
                <textarea
                  rows={2}
                  value={config.instructions}
                  onChange={(e) => updateInstructions(key, e.target.value)}
                  placeholder={`How to pay via ${methodLabels[key]}...`}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button className={'save-btn' + (saved ? ' success' : '')} onClick={handleSave} style={{ marginTop: 12 }}>
        {saved ? 'Saved!' : 'Save Payment Settings'}
      </button>
    </div>
  );
}
