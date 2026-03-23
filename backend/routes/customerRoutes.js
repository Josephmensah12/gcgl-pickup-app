const router = require('express').Router();
const c = require('../controllers/customerController');
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
module.exports = router;
