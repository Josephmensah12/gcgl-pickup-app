const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: [
    'https://josephmensah12.github.io',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/customers/:customerId/recipients', require('./routes/recipientRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/catalog', require('./routes/catalogRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
