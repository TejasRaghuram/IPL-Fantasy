const create = async (req, res) => {
    const {
        name, 
        password
    } = req.body;

    try {
        res.status(200).json({name: 'name'});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const verify = async (req, res) => {
    const {
        name,
        password
    } = req.body;

    try {
        res.status(200).json({name: 'name'});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const join = async (req, res) => {
    const {
        username,
        league,
        players,
        captain,
        vice_captain
    } = req.body;

    try {
        res.status(200).json({});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

const squad = async (req, res) => {
    const {
        username,
        league
    } = req.body;

    try {
        res.status(200).json({
            points: 0,
            players: [
                {
                    name: 'name',
                    points: 0
                }
            ],
            captain: 'name',
            vice_captain: 'name',
            stats: {}
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify,
    join,
    squad
};