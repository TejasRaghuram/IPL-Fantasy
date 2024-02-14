const express = require('express');

const router = express.Router();

const {
    points, 
    all
} = require('../controllers/playersController');

router.post('/points', points);

router.get('/all', all);

module.exports = router;