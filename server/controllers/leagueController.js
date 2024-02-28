const Squad = require('./../models/Squad');
const Player = require('./../models/Player');

const users = async (req, res) => {
    const {
        league
    } = req.body;

    try {
        const users = await Squad.find({'league': league}, 'username points -_id');
        if(!users)
        {
            res.status(400).json({error: 'League Does Not Exist'});
        }
        else
        {
            res.status(200).json(users);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const squad = async (req, res) => {
    const {
        username,
        league
    } = req.body;

    try {
        const squad = await Squad.findOne({'username': username, 'league': league});
        if(!squad)
        {
            res.status(400).json({error: 'User or League Does Not Exist'});
        }
        else
        {
            res.status(200).json(squad);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const add = async (req, res) => {
    const {
        username,
        league,
        player
    } = req.body;

    try {
        const squad = await Squad.findOne({'username': username, 'league': league});
        if(!squad)
        {
            res.status(400).json({error: 'User or League Does Not Exist'});
        }
        else
        {
            if(squad.players.includes(player))
            {
                res.status(400).json({error: 'Player Already in Squad'});
            }
            else
            {
                const exists = await Player.findOne({'name': player});
                if(exists)
                {
                    squad.players.push(player);
                    await squad.save();
                    res.status(200).json(squad);
                }
                else
                {
                    res.status(400).json({error: 'Player Does Not Exist'});
                }
            }
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    users,
    squad,
    add
}