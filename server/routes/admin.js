const express = require('express');

const router = express.Router();

const {
    update
} = require('../controllers/adminController');

router.get('/update', update);

module.exports = router;