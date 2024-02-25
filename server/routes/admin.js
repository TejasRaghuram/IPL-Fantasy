const express = require('express');

const router = express.Router();

const {
    verify,
    matches,
    update,
    add
} = require('../controllers/adminController');

router.post('/verify', verify);

router.get('/matches', matches);

router.post('/update', update);

router.post('/add', add);

module.exports = router;