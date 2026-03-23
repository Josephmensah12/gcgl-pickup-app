import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveRecipient, getRecipients } from '../utils/storage';
import { generateId } from '../utils/helpers';
import './RecipientForm.css';

export default function RecipientForm() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const existingRecipients = getRecipients(customerId);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', country: 'Ghana', address: '',
  });
  const [makeDefault, setMakeDefault] = useState(existingRecipients.length === 0);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.country.trim()) errs.country = 'Required';
    if (!form.address.trim()) errs.address = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const recipient = {
      id: generateId(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      address: form.address.trim(),
      isDefault: makeDefault,
    };
    saveRecipient(customerId, recipient);
    navigate(`/pickup/${customerId}/${recipient.id}`, { replace: true });
  };

  return (
    <div className="recip-form-page">
      <h2>New Recipient (Ship To)</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+233 XX XXX XXXX" />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Address Line 1 *</label>
          <input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="Accra" />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>
          <div className="form-group">
            <label>Country *</label>
            <input value={form.country} onChange={(e) => handleChange('country', e.target.value)} />
            {errors.country && <span className="field-error">{errors.country}</span>}
          </div>
        </div>

        <label className="checkbox-label">
          <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} />
          Set as default recipient
        </label>

        <button type="submit" className="submit-btn">Save & Continue</button>
      </form>
    </div>
  );
}
