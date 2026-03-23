const { Invoice, LineItem, Photo, Sequence } = require('../models');
const sequelize = require('../config/database');

exports.list = async (req, res) => {
  const invoices = await Invoice.findAll({
    include: [{ model: LineItem, as: 'lineItems', include: [{ model: Photo, as: 'photos' }] }],
    order: [['created_at', 'DESC']],
  });
  res.json(invoices);
};

exports.get = async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id, {
    include: [{ model: LineItem, as: 'lineItems', include: [{ model: Photo, as: 'photos', order: [['sort_order', 'ASC']] }], order: [['sort_order', 'ASC']] }],
  });
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  res.json(invoice);
};

exports.getNextNumber = async (req, res) => {
  const result = await sequelize.transaction(async (t) => {
    const [seq] = await Sequence.findOrCreate({ where: { key: 'next_invoice_num' }, defaults: { value: 10001 }, transaction: t });
    const num = seq.value;
    await Sequence.update({ value: num + 1 }, { where: { key: 'next_invoice_num' }, transaction: t });
    return num;
  });
  res.json({ number: result });
};

exports.create = async (req, res) => {
  const { lineItems, ...invoiceData } = req.body;
  const invoice = await sequelize.transaction(async (t) => {
    const inv = await Invoice.create(invoiceData, { transaction: t });
    if (lineItems && lineItems.length > 0) {
      for (let i = 0; i < lineItems.length; i++) {
        const { photos, dimensions, discount, ...itemData } = lineItems[i];
        const li = await LineItem.create({
          ...itemData,
          invoiceId: inv.id,
          dimensionsL: dimensions?.length || null,
          dimensionsW: dimensions?.width || null,
          dimensionsH: dimensions?.height || null,
          discountType: discount?.type || null,
          discountAmount: discount?.amount || null,
          sortOrder: i,
        }, { transaction: t });
        if (photos && photos.length > 0) {
          await Photo.bulkCreate(
            photos.map((data, j) => ({ lineItemId: li.id, data, sortOrder: j })),
            { transaction: t }
          );
        }
      }
    }
    return inv;
  });
  const full = await Invoice.findByPk(invoice.id, {
    include: [{ model: LineItem, as: 'lineItems', include: [{ model: Photo, as: 'photos' }] }],
  });
  res.status(201).json(full);
};

exports.update = async (req, res) => {
  const { lineItems, ...invoiceData } = req.body;
  const invoice = await Invoice.findByPk(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Not found' });

  await sequelize.transaction(async (t) => {
    await invoice.update(invoiceData, { transaction: t });
    if (lineItems && lineItems.length > 0) {
      const existingCount = await LineItem.count({ where: { invoiceId: invoice.id } });
      for (let i = 0; i < lineItems.length; i++) {
        const { photos, dimensions, discount, ...itemData } = lineItems[i];
        const existing = await LineItem.findByPk(itemData.id, { transaction: t });
        if (!existing) {
          const li = await LineItem.create({
            ...itemData,
            invoiceId: invoice.id,
            dimensionsL: dimensions?.length || null,
            dimensionsW: dimensions?.width || null,
            dimensionsH: dimensions?.height || null,
            discountType: discount?.type || null,
            discountAmount: discount?.amount || null,
            sortOrder: existingCount + i,
          }, { transaction: t });
          if (photos && photos.length > 0) {
            await Photo.bulkCreate(
              photos.map((data, j) => ({ lineItemId: li.id, data, sortOrder: j })),
              { transaction: t }
            );
          }
        }
      }
    }
  });

  const full = await Invoice.findByPk(invoice.id, {
    include: [{ model: LineItem, as: 'lineItems', include: [{ model: Photo, as: 'photos' }] }],
  });
  res.json(full);
};
