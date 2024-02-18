const express = require('express');

const router = express.Router();

const {
    verify,
    update,
    add
} = require('../controllers/adminController');

router.post('/verify', verify);

router.post('/update', update);

router.post('/add', add);

module.exports = router;