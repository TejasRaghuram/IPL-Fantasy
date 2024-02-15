require('dotenv').config();

const User = require('../models/User');

const verify = async (req, res) => {
    const { 
        password
    } = req.body;
    const leagues = [];

    if(password === process.env.ADMIN_PASSWORD)
    {
        res.status(200).json(password);
    }
    else
    {
        res.status(400).json({error: 'Inavlid Password'});
    }
};

const update = async (req, res) => {
    
};

module.exports = {
    verify,
    update
};