const League = require('./../models/League');
const Squad = require('./../models/Squad');

const leagues = async (req, res) => {
    const {
        username
    } = req.body;

    try {
        const leagues = await Squad.find({'username': username}, 'league -_id');
        res.status(200).json(leagues);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const join = async (req, res) => {
    const {
        username,
        name,
        password
    } = req.body;

    try {
        const league = await League.findOne({'name': name});
        const squad = await Squad.findOne({'username': username, 'league': name});
        if(squad)
        {
            res.status(400).json({error: 'Already In League'});
        }
        else if(!league)
        {
            res.status(400).json({error: 'League Does Not Exist'});
        }
        else if(password != league.password)
        {
            res.status(400).json({error: 'Invalid Password'});
        }
        else
        {
            const squad = await Squad.create({
                username: username,
                league: name
            });
            res.status(200).json(squad);
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

    try {
        const exists = await League.findOne({'name': name});
        if(exists)
        {
            res.status(400).json({error: 'League Already Exists'});
        }
        else if(name.length === 0 || password.length === 0 || !name.match(/^[\p{L}\p{N}]*$/u) || !password.match(/^[\p{L}\p{N}]*$/u) || name === 'admin' || name === 'profile')
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