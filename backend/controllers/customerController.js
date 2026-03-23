const { Customer, Recipient } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  const { q } = req.query;
  const where = q ? {
    [Op.or]: [
      { fullName: { [Op.iLike]: `%${q}%` } },
      { phone: { [Op.iLike]: `%${q}%` } },
      { address: { [Op.iLike]: `%${q}%` } },
    ],
  } : {};
  const customers = await Customer.findAll({ where, include: [{ model: Recipient, as: 'recipients' }], order: [['created_at', 'DESC']] });
  res.json(customers);
};

exports.get = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id, { include: [{ model: Recipient, as: 'recipients' }] });
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json(customer);
};

exports.create = async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
};

exports.update = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  await customer.update(req.body);
  res.json(customer);
};
