const router = require('express').Router();
const c = require('../controllers/invoiceController');
router.get('/next-number', c.getNextNumber);
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
module.exports = router;
