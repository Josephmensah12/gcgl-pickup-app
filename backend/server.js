require('dotenv').config();
const app = require('./app');
const db = require('./models');
const seedCatalog = require('./seeders/seedCatalog');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');
    await db.sequelize.sync({ alter: true });
    console.log('Models synced');
    await seedCatalog();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();
