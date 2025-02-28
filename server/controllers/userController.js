const create = async (req, res) => {
    const {
        username,
        name, 
        password
    } = req.body;

    try {
        res.status(200).json({username: 'username'});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const verify = async (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        res.status(200).json({username: 'username'});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const leagues = async (req, res) => {
    const {
        username
    } = req.body;

    try {
        res.status(200).json({
            league: {
                name1: 0,
                name2: 0,
                name3: 0
            }
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify,
    leagues
};