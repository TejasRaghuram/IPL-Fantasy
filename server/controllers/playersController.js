const Player = require('./../models/Player');

const all = async (req, res) => {
    try {
        const players = await Player.find({}, 'name points -_id');
        return res.status(200).json(players);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const get = async (req, res) => {
    const {
        name
    } = req.body;

    try {
        const player = await Player.findOne({'name': name});
        return res.status(200).json(player);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    all,
    get
};