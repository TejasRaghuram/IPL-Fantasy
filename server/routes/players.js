const express = require('express');

const router = express.Router();

const {
    all,
    get
} = require('../controllers/playersController');

router.get('/all', all);

router.post('/get', get);

module.exports = router;