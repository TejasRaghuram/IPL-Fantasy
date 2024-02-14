const express = require('express');

const router = express.Router();

const {
    verify,
    update
} = require('../controllers/adminController');

router.post('/verify', verify);

router.post('/update', update);

module.exports = router;