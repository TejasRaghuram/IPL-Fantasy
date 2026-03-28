const express = require('express');

const router = express.Router();

const {
    update,
    matches,
    current,
    add_player,
    add_matches,
    test
} = require('../controllers/adminController');

router.post('/update', update);

router.get('/matches', matches);

router.get('/current', current);

router.post('/add_player', add_player);

router.post('/add_matches', add_matches);

router.get('/test', test);

module.exports = router;