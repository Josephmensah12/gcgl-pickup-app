const router = require('express').Router({ mergeParams: true });
const c = require('../controllers/recipientController');
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
module.exports = router;
