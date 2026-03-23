const { Setting } = require('../models');

const DEFAULT_SETTINGS = {
  companyInfo: { name: 'GCGL Logistics', logo: null, address: 'Houston, TX', phone: '', email: '', website: '' },
  branding: { primaryColor: '#1a56db', footerText: 'Thank you for choosing GCGL Logistics!' },
  paymentMethods: {
    square: { enabled: false, instructions: '' },
    zelle: { enabled: false, instructions: '' },
    cash: { enabled: true, instructions: 'Cash accepted at pickup' },
    check: { enabled: false, instructions: '' },
  },
  shipmentSettings: {
    capacityType: 'money',
    moneyThresholds: { min: 25000, max: 30000 },
    volumeCapacity: 2390,
    weightCapacity: 67200,
  },
  policies: {
    prohibited: ['Flammable materials', 'Explosives', 'Perishable goods without proper packaging', 'Illegal substances'],
    terms: "All items shipped at owner's risk. GCGL Logistics is not liable for damages during transit.",
    disclaimers: 'Prices are subject to change. Delivery times are estimated and not guaranteed.',
  },
};

exports.get = async (req, res) => {
  const setting = await Setting.findByPk(1);
  res.json(setting ? setting.data : DEFAULT_SETTINGS);
};

exports.update = async (req, res) => {
  const [setting] = await Setting.upsert({ id: 1, data: req.body });
  res.json(setting.data);
};
