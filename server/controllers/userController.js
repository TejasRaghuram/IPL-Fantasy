const User = require('../models/User');
const League = require('./../models/League');

const leagues = async (req, res) => {
    
};

const join = async (req, res) => {
    const {
        username,
        name,
        password
    } = req.body;

    try {
        const user = await User.findOne({'username': username});
        const league = await League.findOne({'name': name});
        if(user.leagues.includes(name))
        {
            res.status(400).json({error: 'Already In League'});
        }
        else if(!league)
        {
            res.status(400).json({error: 'League Does Not Exist'});
        }
        else if(user.password != league.password)
        {
            res.status(400).json({error: 'Invalid Password'});
        }
        else
        {
            user.leagues.push(league.name);
            res.status(200).json(league);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const create = async (req, res) => {
    const {
        name, 
        password
    } = req.body;
    const leagues = [];

    try {
        const exists = await League.findOne({'name': name});
        if(exists)
        {
            res.status(400).json({error: 'League Already Exists'});
        }
        else if(name.length === 0 || password.length === 0 || !name.match(/^[\p{L}\p{N}]*$/u) || !password.match(/^[\p{L}\p{N}]*$/u))
        {
            res.status(400).json({error: 'Invalid Name or Password'});
        }
        else
        {
            const league = await League.create({
                name, 
                password
            });
            res.status(200).json(league);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    leagues,
    join,
    create
};