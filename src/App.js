import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import ItemEntry from './pages/ItemEntry';
import InvoiceDisplay from './pages/InvoiceDisplay';
import InvoiceList from './pages/InvoiceList';
import LabelPrint from './pages/LabelPrint';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/items/new" element={<ItemEntry />} />
            <Route path="/invoice/:id" element={<InvoiceDisplay />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/labels/:id" element={<LabelPrint />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
