const express = require('express');
const router = express.Router();
const streamerDao = require('../dao/test.dao');

router.get('/', streamerDao.getAll);
router.get('/:id', streamerDao.getById);
router.post('/', streamerDao.create);
router.put('/:id', streamerDao.update);
router.delete('/:id', streamerDao.remove);

module.exports = router;
