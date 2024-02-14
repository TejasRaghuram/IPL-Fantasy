const express = require('express');

const router = express.Router();

const {
    create,
    verify
} = require('../controllers/accountController');

router.post('/create', create);

router.post('/verify', verify);

module.exports = router;