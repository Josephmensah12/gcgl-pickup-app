import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="app-header">
      <div className="header-left">
        {!isHome && (
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        )}
      </div>
      <h1 className="header-title" onClick={() => navigate('/')}>
        GCGL Pickup
      </h1>
      <div className="header-right">
        {!isAdmin ? (
          <button className="admin-btn" onClick={() => navigate('/admin')}>
            ⚙️
          </button>
        ) : (
          <button className="admin-btn" onClick={() => navigate('/')}>
            🏠
          </button>
        )}
      </div>
    </header>
  );
}
