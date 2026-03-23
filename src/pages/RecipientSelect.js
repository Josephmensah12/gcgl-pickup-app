import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, getRecipients } from '../utils/api';
import './RecipientSelect.css';

export default function RecipientSelect() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCustomer(customerId), getRecipients(customerId)])
      .then(([c, r]) => {
        setCustomer(c);
        setRecipients(r);
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <div className="page-pad"><p>Loading...</p></div>;
  if (!customer) return <div className="page-pad"><p>Customer not found.</p></div>;

  return (
    <div className="page-pad">
      <div className="customer-banner">
        <span className="banner-label">Ship From</span>
        <span className="banner-name">{customer.fullName}</span>
      </div>

      <h2>Select Recipient (Ship To)</h2>

      <button className="new-btn" onClick={() => navigate(`/customer/${customerId}/recipients/new`)}>
        + Add New Recipient
      </button>

      {recipients.length === 0 && (
        <p className="empty-text">No recipients yet. Add one to continue.</p>
      )}

      {recipients.map((r) => (
        <div
          key={r.id}
          className={'recipient-card' + (r.isDefault ? ' default' : '')}
          onClick={() => navigate(`/pickup/${customerId}/${r.id}`)}
        >
          {r.isDefault && <span className="default-tag">Default</span>}
          <div className="recip-name">{r.firstName} {r.lastName}</div>
          <div className="recip-info">{r.phone}</div>
          <div className="recip-info">{r.address}, {r.city}, {r.country}</div>
        </div>
      ))}
    </div>
  );
}
