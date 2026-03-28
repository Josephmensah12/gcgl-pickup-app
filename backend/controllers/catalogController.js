const { CatalogItem } = require('../models');

exports.list = async (req, res) => {
  const items = await CatalogItem.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
  res.json(items);
};

exports.create = async (req, res) => {
  try {
    const item = await CatalogItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Item already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const item = await CatalogItem.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.update(req.body);
  res.json(item);
};

exports.remove = async (req, res) => {
  const item = await CatalogItem.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.json({ success: true });
};
