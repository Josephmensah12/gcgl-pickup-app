import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCustomers } from '../utils/storage';
import './CustomerList.css';

export default function CustomerList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    setCustomers(searchCustomers(query));
  }, [query]);

  return (
    <div className="customer-list-page">
      <h2>Select Customer</h2>

      <input
        className="search-input"
        type="text"
        placeholder="Search by name, phone, or address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <button
        className="new-customer-btn"
        onClick={() => navigate('/customers/new')}
      >
        + Add New Customer
      </button>

      <div className="customer-results">
        {customers.length === 0 && (
          <p className="no-results">
            {query ? 'No customers found.' : 'No customers yet. Add one to get started.'}
          </p>
        )}
        {customers.map((c) => (
          <div
            key={c.id}
            className="customer-card"
            onClick={() => navigate(`/items/new?customerId=${c.id}`)}
          >
            <div className="customer-name">{c.fullName}</div>
            <div className="customer-info">{c.phone}</div>
            <div className="customer-info">{c.address}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
