const { League, Squad, User, Player } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const create = async (req, res) => {
    const {
        name, 
        password,
        players
    } = req.body;

    try {
        if (name.length <= 3) {
            return res.status(400).json({error: 'Names Must be at Least 4 Characters Long'});
        }
        if (password.length <= 3) {
            return res.status(400).json({error: 'Passwords Must be at Least 4 Characters Long'});
        }
        if (players < 2 || players > 18) {
            return res.status(400).json({error: 'Squads Must Have at Least 2 Players and at Most 18 Players'})
        }
        const exists = await League.findOne({ where: {
            name: name
        }});
        if (exists) {
            return res.status(400).json({error: 'Name is Already Taken'});
        }
        bcrypt.hash(password, 0, async (err, hash) => {
            const league = await League.create({
                name: name,
                password: hash,
                players: players
            });
            return res.status(200).json(league);
        });
    } catch(error) {
        return res.status(400).json({error: error.message});
    }
}

const verify = async (req, res) => {
    const {
        name,
        password
    } = req.body;

    try {
        const league = await League.findOne({ where: {
            name: name
        }});
        if (!league) {
            return res.status(400).json({error: 'Invalid Name or Password'});
        }
        bcrypt.compare(password, league.password, function(err, result) {
            if (result) {
                return res.status(200).json(league);
            } else {
                return res.status(400).json({error: 'Invalid Name or Password'});
            }
        });
    } catch(error) {
        return res.status(400).json({error: error.message});
    }
}

const join = async (req, res) => {
    const {
        username,
        name,
        players,
        display
    } = req.body;

    try {
        const user = await User.findOne({ where: {
            username: username
        }});
        if (!user) return res.status(400).json({error: 'User Does Not Exist'});
        const league = await League.findOne({ where: {
            name: name
        }});
        if (!league) return res.status(400).json({error: 'League Does Not Exist'});
        const teams = await Squad.findAll({ where: {
            league: name
        }});
        if (teams.length == 10) return res.status(400).json({error: 'League is Full'});
        if (display.length == 0) return res.status(400).json({error: 'Squad Name is Required'});
        const exists = await Squad.findOne({
            where: {
                league: name,
                username: username
            }
        });
        if (exists) return res.status(400).json({error: 'Already in League'});
        if (players.length != league.players) return res.status(400).json({error: 'Incorrect Number of Players'});
        if (new Set(players).size !== players.length) return res.status(400).json({error: 'No Duplicates are Allowed'});
        const members = [];
        for (const player of players) {
            const exists = await Player.findOne({ where: {
                name: player
            }});
            if (!exists) {
                return res.status(400).json({error: player + ' Does Not Exist (Check Spelling)'});
            } else {
                members.push({
                    name: exists.name,
                    active: true,
                    earned: 0
                });
            }
        }
        user.leagues.push(league.name);
        user.changed('leagues', true);
        const team = {
            league: league.name,
            username: username,
            name: display,
            base_points: 0,
            bonus_points: 0,
            points: 0,
            captain: players[0],
            vice_captain: players[1],
            players: members,
            bonuses: [],
            runs: 0,
            fours: 0,
            sixes: 0,
            ducks: 0,
            half_centuries: 0,
            centuries: 0,
            strike_rate: 0,
            balls_faced: 0,
            batting_average: 0,
            not_outs: 0,
            dismissals: 0,
            wickets: 0,
            dots: 0,
            four_wicket_hauls: 0,
            five_wicket_hauls: 0,
            six_wicket_hauls: 0,
            maidens: 0,
            hat_tricks: 0,
            economy: 0,
            bowling_average: 0,
            bowling_strike_rate: 0,
            balls_bowled: 0,
            runs_conceded: 0,
            catches: 0,
            stumpings: 0,
            player_of_matches: 0
        };
        await user.save();
        const squad = await Squad.create(team);

        const bonuses = {
            'runs': 1000,
            'batting_average': 750,
            'strike_rate': 750,
            'centuries': 500,
            'half_centuries': 500,
            'highest_score': 500,
            'sixes': 250,
            'fours': 250,
            'not_outs': 250,
            'ducks': -500,
            'wickets': 1000,
            'bowling_average': 750,
            'bowling_strike_rate': 750,
            'economy': 750,
            'four_wicket_hauls': 500,
            'five_wicket_hauls': 500,
            'six_wicket_hauls': 500,
            'hat_tricks': 500,
            'maidens': 250,
            'dots': 250,
            'catches': 1000,
            'stumpings': 1000,
            'player_of_matches': 1000
        }

        const athletes = await Player.findAll({});
        const map = {};
        for (const player of athletes) map[player.name] = player;
        
        const squads = await Squad.findAll({ where: { league: name }});

        for (const squad of squads) {
            squad.points = 0;
            squad.bonuses = [];
            squad.bonus_points = 0;
            squad.base_points = 0;
            squad.runs = 0;
            squad.fours = 0;
            squad.sixes = 0;
            squad.ducks = 0;
            squad.half_centuries = 0;
            squad.centuries = 0;
            squad.not_outs = 0;
            squad.balls_faced = 0;
            squad.dismissals = 0;
            squad.wickets = 0;
            squad.dots = 0;
            squad.four_wicket_hauls = 0;
            squad.five_wicket_hauls = 0;
            squad.six_wicket_hauls = 0;
            squad.maidens = 0;
            squad.hat_tricks = 0;
            squad.balls_bowled = 0;
            squad.runs_conceded = 0;
            squad.catches = 0;
            squad.stumpings = 0;
            squad.player_of_matches = 0;
            for (const player of squad.players) {
                if (player.name == squad.captain) {
                    squad.base_points += 2 * map[player.name].points;
                } else if (player.name == squad.vice_captain) {
                    squad.base_points += Math.round(1.5 * map[player.name].points);
                } else {
                    squad.base_points += map[player.name].points;
                }
                squad.runs += map[player.name].runs;
                squad.fours += map[player.name].fours;
                squad.sixes += map[player.name].sixes;
                squad.ducks += map[player.name].ducks;
                squad.half_centuries += map[player.name].half_centuries;
                squad.centuries += map[player.name].centuries;
                squad.not_outs += map[player.name].not_outs;
                squad.balls_faced += map[player.name].balls_faced;
                squad.dismissals += map[player.name].dismissals;
                squad.wickets += map[player.name].wickets;
                squad.dots += map[player.name].dots;
                squad.four_wicket_hauls += map[player.name].four_wicket_hauls;
                squad.five_wicket_hauls += map[player.name].five_wicket_hauls;
                squad.six_wicket_hauls += map[player.name].six_wicket_hauls;
                squad.maidens += map[player.name].maidens;
                squad.hat_tricks += map[player.name].hat_tricks;
                squad.balls_bowled += map[player.name].balls_bowled;
                squad.runs_conceded += map[player.name].runs_conceded;
                squad.catches += map[player.name].catches;
                squad.stumpings += map[player.name].stumpings;
                squad.player_of_matches += map[player.name].player_of_matches;
            }
            squad.strike_rate = squad.balls_faced > 0 ? 100 * squad.runs / squad.balls_faced : 0;
            squad.batting_average = squad.dismissals > 0 ? squad.runs / squad.dismissals : squad.runs;
            squad.economy = squad.balls_bowled > 0 ? 6 * squad.runs_conceded / squad.balls_bowled : squad.runs_conceded;
            squad.bowling_average = squad.wickets > 0 ? squad.runs_conceded / squad.wickets : squad.runs_conceded;
            squad.bowling_strike_rate = squad.wickets > 0 ? squad.balls_bowled / squad.wickets : squad.balls_bowled;
        }

        for (const [bonus, value] of Object.entries(bonuses)) {
            const most = bonus != 'bowling_average' && bonus != 'bowling_strike_rate' && bonus != 'economy';
            const batting_threshold = bonus == 'strike_rate' || bonus == 'batting_average';
            const bowling_threshold = bonus == 'bowling_average' || bonus == 'bowling_strike_rate' || bonus == 'economy';
            let best = most ? Number.MIN_VALUE : Number.MAX_VALUE;
            for (const squad of squads)
                if ((!batting_threshold || squad.balls_faced >= 50) &&
                    (!bowling_threshold || squad.balls_bowled >= 30))
                    best = most ? Math.max(best, squad[bonus]) : Math.min(best, squad[bonus]);
            best = Math.round(best * 1e10) / 1e10;
            if (best == 0 && most) best = Number.MAX_VALUE;
            const to_add = new Set();
            for (const squad of squads) {
                if ((!batting_threshold || squad.balls_faced >= 50) &&
                    (!bowling_threshold || squad.balls_bowled >= 30) &&
                    Math.round(squad[bonus] * 1e10) / 1e10 == best)  {
                    to_add.add(squad);
                }
            }
            for (const squad of squads) {
                if (to_add.has(squad)) {
                    const points = 2 * value / to_add.size;
                    squad.bonuses = [...squad.bonuses, {[bonus]: Math.round(points)}];
                    squad.bonus_points += Math.round(points);
                }
            }
        }

        for (const squad of squads) squad.points = squad.base_points + squad.bonus_points;

        await Promise.all(squads.map(squad => squad.save()));

        return res.status(200).json(squad);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

const squad = async (req, res) => {
    const {
        username,
        name
    } = req.body;

    try {
        const squad = await Squad.findOne({ where: {
            username: username,
            league: name
        }});
        if (!squad) {
            return res.status(400).json({error: 'Squad Does Not Exist'});
        }
        const players = await Player.findAll({ where: {
            name: {
                [Op.in]: squad.players.map(item => item.name)
            }
        }});

        return res.status(200).json({squad, players});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify,
    join,
    squad
};