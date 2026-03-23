const { Shipment } = require('../models');

exports.list = async (req, res) => {
  const shipments = await Shipment.findAll({ order: [['created_at', 'DESC']] });
  res.json(shipments);
};

exports.create = async (req, res) => {
  const shipment = await Shipment.create(req.body);
  res.status(201).json(shipment);
};

exports.update = async (req, res) => {
  const shipment = await Shipment.findByPk(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Not found' });
  await shipment.update(req.body);
  res.json(shipment);
};
