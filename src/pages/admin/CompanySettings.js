import React, { useState } from 'react';
import { getCompanySettings, saveCompanySettings } from '../../utils/storage';
import './Admin.css';

export default function CompanySettings() {
  const [settings, setSettings] = useState(getCompanySettings());
  const [saved, setSaved] = useState(false);
  const info = settings.companyInfo;

  const update = (field, value) => {
    setSettings((p) => ({ ...p, companyInfo: { ...p.companyInfo, [field]: value } }));
    setSaved(false);
  };

  const updateBranding = (field, value) => {
    setSettings((p) => ({ ...p, branding: { ...p.branding, [field]: value } }));
    setSaved(false);
  };

  const handleSave = () => {
    saveCompanySettings(settings);
    setSaved(true);
  };

  return (
    <div className="admin-page">
      <h2>Company Settings</h2>
      <div className="admin-form">
        <div className="form-group">
          <label>Company Name</label>
          <input value={info.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Business Address</label>
          <input value={info.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="tel" value={info.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={info.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input value={info.website} onChange={(e) => update('website', e.target.value)} />
        </div>

        <h3 style={{ marginTop: 20 }}>Branding</h3>
        <div className="form-group">
          <label>Primary Color</label>
          <input type="color" value={settings.branding.primaryColor} onChange={(e) => updateBranding('primaryColor', e.target.value)} style={{ height: 44 }} />
        </div>
        <div className="form-group">
          <label>Invoice Footer Text</label>
          <textarea value={settings.branding.footerText} onChange={(e) => updateBranding('footerText', e.target.value)} />
        </div>

        <button className={'save-btn' + (saved ? ' success' : '')} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        {saved && <div className="saved-msg">Settings saved successfully.</div>}
      </div>
    </div>
  );
}
