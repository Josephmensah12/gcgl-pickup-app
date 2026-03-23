const { Recipient } = require('../models');

exports.list = async (req, res) => {
  const recipients = await Recipient.findAll({ where: { customerId: req.params.customerId }, order: [['is_default', 'DESC'], ['created_at', 'DESC']] });
  res.json(recipients);
};

exports.get = async (req, res) => {
  const r = await Recipient.findOne({ where: { id: req.params.id, customerId: req.params.customerId } });
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
};

exports.create = async (req, res) => {
  const data = { ...req.body, customerId: req.params.customerId };
  if (data.isDefault) {
    await Recipient.update({ isDefault: false }, { where: { customerId: req.params.customerId } });
  }
  const r = await Recipient.create(data);
  res.status(201).json(r);
};

exports.update = async (req, res) => {
  const r = await Recipient.findOne({ where: { id: req.params.id, customerId: req.params.customerId } });
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (req.body.isDefault) {
    await Recipient.update({ isDefault: false }, { where: { customerId: req.params.customerId } });
  }
  await r.update(req.body);
  res.json(r);
};
