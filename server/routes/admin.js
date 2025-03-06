const express = require('express');

const router = express.Router();

const {
    update,
    add_player
} = require('../controllers/adminController');

router.get('/update', update);

router.post('/add_player', add_player)

module.exports = router;