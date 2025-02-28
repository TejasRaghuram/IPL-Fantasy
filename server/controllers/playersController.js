const all = async (req, res) => {
    try {
        res.status(200).json([
            {
                name: 'name0',
                team: 'team',
                position: 'position',
                points: 0
            },
            {
                name: 'name1',
                team: 'team',
                position: 'position',
                points: 0
            },
            {
                name: 'name2',
                team: 'team',
                position: 'position',
                points: 0
            },
        ]);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const get = async (req, res) => {
    const {
        name
    } = req.body;

    try {
        res.status(200).json({
            name: 'name',
            points: 'points',
            stats: {}
        });
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    all,
    get
};