const router = require('express').Router();
const c = require('../controllers/shipmentController');
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);
module.exports = router;
