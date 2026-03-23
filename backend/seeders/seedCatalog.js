const { CatalogItem } = require('../models');

const DEFAULT_CATALOG = [
  { id: 'cat-1', name: 'Small Box', description: '12"×12"×12"', category: 'Boxes', price: 15.84, active: true },
  { id: 'cat-2', name: 'Medium Box', description: '18"×18"×18"', category: 'Boxes', price: 35.64, active: true },
  { id: 'cat-3', name: 'Large Box', description: '24"×24"×24"', category: 'Boxes', price: 63.50, active: true },
  { id: 'cat-4', name: 'TV 32" LED', description: '32 inch LED Television', category: 'Televisions', price: 45.00, active: true },
  { id: 'cat-5', name: 'TV 55" LED', description: '55 inch LED Television', category: 'Televisions', price: 75.00, active: true },
  { id: 'cat-6', name: 'Ice Chest Small', description: 'Small ice chest / cooler', category: 'Ice Chests', price: 25.00, active: true },
  { id: 'cat-7', name: 'Ice Chest Large', description: 'Large ice chest / cooler', category: 'Ice Chests', price: 40.00, active: true },
  { id: 'cat-8', name: 'Tote Standard', description: 'Standard storage tote', category: 'Totes', price: 20.00, active: true },
];

async function seedCatalog() {
  const count = await CatalogItem.count();
  if (count === 0) {
    await CatalogItem.bulkCreate(DEFAULT_CATALOG);
    console.log('Seeded default catalog items');
  }
}

module.exports = seedCatalog;
