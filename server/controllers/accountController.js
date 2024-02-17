const User = require('../models/User');

const create = async (req, res) => {
    const {
        username, 
        password
    } = req.body;
    const leagues = [];

    try {
        const exists = await User.findOne({'username': username});
        if(exists)
        {
            res.status(400).json({error: 'Account Already Exists'});
        }
        else if(username.length === 0 || password.length === 0 || !username.match(/^[\p{L}\p{N}]*$/u) || !password.match(/^[\p{L}\p{N}]*$/u))
        {
            res.status(400).json({error: 'Invalid Username or Password'});
        }
        else
        {
            const account = await User.create({
                username, 
                password, 
                leagues
            });
            res.status(200).json(account);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const verify = async (req, res) => {
    const {
        username, 
        password
    } = req.body;
    const leagues = [];

    try {
        const user = await User.findOne({'username': username});
        if(user)
        {
            if(password === user.password)
            {
                res.status(200).json(user);
            }
            else
            {
                res.status(400).json({error: 'Invalid Password'});
            }
        }
        else
        {
            res.status(400).json({error: 'Account Does Not Exist'});
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify
};