import React, { useState } from 'react';
import { getCompanySettings, saveCompanySettings } from '../../utils/storage';
import './Admin.css';

export default function PolicyEditor() {
  const [settings, setSettings] = useState(getCompanySettings());
  const [newProhibited, setNewProhibited] = useState('');
  const [saved, setSaved] = useState(false);

  const policies = settings.policies;

  const addProhibited = () => {
    if (!newProhibited.trim()) return;
    const updated = {
      ...settings,
      policies: { ...policies, prohibited: [...policies.prohibited, newProhibited.trim()] },
    };
    setSettings(updated);
    setNewProhibited('');
    setSaved(false);
  };

  const removeProhibited = (idx) => {
    const updated = {
      ...settings,
      policies: { ...policies, prohibited: policies.prohibited.filter((_, i) => i !== idx) },
    };
    setSettings(updated);
    setSaved(false);
  };

  const updateField = (field, value) => {
    setSettings((p) => ({ ...p, policies: { ...p.policies, [field]: value } }));
    setSaved(false);
  };

  const handleSave = () => {
    saveCompanySettings(settings);
    setSaved(true);
  };

  return (
    <div className="admin-page">
      <h2>Policies & Terms</h2>

      <h3>Prohibited Items</h3>
      <div className="chip-list">
        {policies.prohibited.map((item, idx) => (
          <span key={idx} className="chip">
            {item}
            <button onClick={() => removeProhibited(idx)}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          style={{ flex: 1, padding: 12, border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 15, outline: 'none' }}
          value={newProhibited}
          onChange={(e) => setNewProhibited(e.target.value)}
          placeholder="Add prohibited item..."
          onKeyDown={(e) => e.key === 'Enter' && addProhibited()}
        />
        <button className="add-btn" style={{ width: 'auto', margin: 0, padding: '0 20px' }} onClick={addProhibited}>Add</button>
      </div>

      <div className="admin-form">
        <div className="form-group">
          <label>Terms & Conditions</label>
          <textarea rows={4} value={policies.terms} onChange={(e) => updateField('terms', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Disclaimers</label>
          <textarea rows={3} value={policies.disclaimers} onChange={(e) => updateField('disclaimers', e.target.value)} />
        </div>

        <button className={'save-btn' + (saved ? ' success' : '')} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Policies'}
        </button>
      </div>
    </div>
  );
}
