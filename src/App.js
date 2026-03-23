import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import RecipientSelect from './pages/RecipientSelect';
import RecipientForm from './pages/RecipientForm';
import ItemEntry from './pages/ItemEntry';
import InvoiceDisplay from './pages/InvoiceDisplay';
import InvoiceList from './pages/InvoiceList';
import LabelPrint from './pages/LabelPrint';
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanySettings from './pages/admin/CompanySettings';
import CatalogManager from './pages/admin/CatalogManager';
import ShipmentSettings from './pages/admin/ShipmentSettings';
import ShipmentList from './pages/admin/ShipmentList';
import PolicyEditor from './pages/admin/PolicyEditor';
import PaymentConfig from './pages/admin/PaymentConfig';
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
            <Route path="/customer/:customerId/recipients" element={<RecipientSelect />} />
            <Route path="/customer/:customerId/recipients/new" element={<RecipientForm />} />
            <Route path="/pickup/:customerId/:recipientId" element={<ItemEntry />} />
            <Route path="/pickup/edit/:invoiceId" element={<ItemEntry />} />
            <Route path="/invoice/:id" element={<InvoiceDisplay />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/labels/:id" element={<LabelPrint />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<CompanySettings />} />
            <Route path="/admin/catalog" element={<CatalogManager />} />
            <Route path="/admin/shipments" element={<ShipmentSettings />} />
            <Route path="/admin/shipments/list" element={<ShipmentList />} />
            <Route path="/admin/policies" element={<PolicyEditor />} />
            <Route path="/admin/payments" element={<PaymentConfig />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
