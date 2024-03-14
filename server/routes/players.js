const express = require('express');

const router = express.Router();

const {
    all
} = require('../controllers/playersController');

router.get('/all', all);

module.exports = router;