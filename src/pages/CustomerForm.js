import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCustomer, getCustomers } from '../utils/storage';
import { generateId } from '../utils/helpers';
import './CustomerForm.css';

export default function CustomerForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', address: '', phone: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    const existing = getCustomers();
    if (existing.some((c) => c.email.toLowerCase() === form.email.toLowerCase().trim())) {
      errs.email = 'Customer with this email already exists';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const customer = {
      id: generateId(),
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      recipients: [],
      createdAt: new Date().toISOString(),
    };
    saveCustomer(customer);
    navigate(`/customer/${customer.id}/recipients`, { replace: true });
  };

  return (
    <div className="customer-form-page">
      <h2>New Customer</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input type="text" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="John Doe" />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="john@example.com" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Full Address *</label>
          <input type="text" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="123 Main St, Houston, TX" />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="(555) 123-4567" />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
        <button type="submit" className="submit-btn">Save & Add Recipient</button>
      </form>
    </div>
  );
}
