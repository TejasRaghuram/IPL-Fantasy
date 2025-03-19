require('dotenv').config();

const { Player, Match, League } = require('../models');
const { Op } = require('sequelize');

const update = async (req, res) => {
    try {
        const matches = await Match.findAll({
            order: [
                ['id', 'ASC']
            ],
        });
        const date = new Date(Date.now() - 4 * 60 * 60 * 1000);
        for (const match of matches) {
            if (date.toISOString() > match.date.toISOString() && match.data == null) {
                const response = await fetch(process.env.SCRAPER_URL + match.match_id);
                if (response.ok) {
                    const data = await response.json();
                    await update_stats(data, match);
                }
            }
        }
        await Player.update({
            bonuses: [],
            bonus_points: 0
        }, {
            where: {},
        });
        const value = {
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
        for (const bonus of Object.keys(value)) {
            await add_bonus(
                bonus, 
                bonus != 'bowling_average' && bonus != 'bowling_strike_rate' && bonus != 'economy',
                bonus == 'strike_rate' || bonus == 'batting_average', 
                bonus == 'bowling_average' || bonus == 'bowling_strike_rate' || bonus == 'economy', 
                value,
                ['runs', 'bating_average', 'strike_rate', 'centuries', 'half_centuries', 'highest_score', 'sixes', 'fours', 'not_outs', 'ducks'].includes(bonus),
                ['wickets', 'bowling_average', 'bowling_strike_rate', 'economy', 'four_wicket_hauls', 'five_wicket_hauls', 'six_wicket_hauls', 'hat_tricks', 'maidens', 'dots'].includes(bonus)
            );
        }
        const leagues = await League.findAll();
        for (const league of leagues) {
            league.squads = add_league_bonuses(league.squads, value);
        }
        const updates = leagues.map((league) => ({
            id: league.id,
            squads: league.squads
        }));
        await League.bulkCreate(updates, {
            updateOnDuplicate: ['squads'],
        });
        await update_players();
        await update_leagues();

        res.status(200).json({});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

async function update_stats(data, match) {
    const players = await Player.findAll({ where: {
        name: {
            [Op.in]: Object.keys(data.players)
        }
    }});
    const playerUpdates = players.map((player) => ({
        id: player.id,
        position: player.position,
        runs: player.runs + data.players[player.name].runs,
        fours: player.fours + data.players[player.name].fours,
        sixes: player.sixes + data.players[player.name].sixes,
        ducks: player.ducks + (data.players[player.name].runs == 0 && data.players[player.name].out ? 1 : 0),
        half_centuries: player.half_centuries + (50 <= data.players[player.name].runs && data.players[player.name].runs < 100 ? 1 : 0),
        centuries: player.centuries + (data.players[player.name].runs >= 100 ? 1 : 0),
        strike_rate: 100 * (player.runs + data.players[player.name].runs) / (player.balls_faced + data.players[player.name].balls_faced > 0 ? player.balls_faced + data.players[player.name].balls_faced : 1),
        balls_faced: player.balls_faced + data.players[player.name].balls_faced,
        batting_average: (player.runs + data.players[player.name].runs) / (player.dismissals + (data.players[player.name].out ? 1 : 0) > 0 ? player.dismissals + (data.players[player.name].out ? 1 : 0) : 1),
        not_outs: player.not_outs + (data.players[player.name].not_out ? 1 : 0),
        dismissals: player.dismissals + (data.players[player.name].out ? 1 : 0),
        highest_score: data.players[player.name].runs > player.highest_score ? data.players[player.name].runs : player.highest_score,
        wickets: player.wickets + data.players[player.name].wickets,
        dots: player.dots + data.players[player.name].dots,
        four_wicket_hauls: player.four_wicket_hauls + (data.players[player.name].wickets == 4 ? 1 : 0),
        five_wicket_hauls: player.five_wicket_hauls + (data.players[player.name].wickets == 5 ? 1 : 0),
        six_wicket_hauls: player.six_wicket_hauls + (data.players[player.name].wickets == 6 ? 1 : 0),
        maidens: player.maidens + data.players[player.name].maidens,
        hat_tricks: player.hat_tricks + data.players[player.name].hat_tricks,
        economy: 6 * (player.runs_conceded + data.players[player.name].runs_conceded) / (player.balls_bowled + data.players[player.name].balls_bowled > 0 ? player.balls_bowled + data.players[player.name].balls_bowled : 1),
        bowling_average: (player.runs_conceded + data.players[player.name].runs_conceded) / (player.wickets + data.players[player.name].wickets > 0 ? player.wickets + data.players[player.name].wickets : 1),
        bowling_strike_rate: (player.balls_bowled + data.players[player.name].balls_bowled) / (player.wickets + data.players[player.name].wickets > 0 ? player.wickets + data.players[player.name].wickets : 1),
        balls_bowled: player.balls_bowled + data.players[player.name].balls_bowled,
        runs_conceded: player.runs_conceded + data.players[player.name].runs_conceded,
        catches: player.catches + data.players[player.name].catches,
        stumpings: player.stumpings + data.players[player.name].stumpings,
        player_of_matches: player.player_of_matches + (data.player_of_match == player.name ? 1 : 0)
    }));
    playerUpdates.forEach((player) => {
        player.base_points = base_points(player);
    });
    await Player.bulkCreate(playerUpdates, {
        updateOnDuplicate: Object.keys(playerUpdates[0]).filter(key => key != 'id'),
    });
    const leagues = await League.findAll();
    const leagueUpdates = leagues.map((league) => ({
        id: league.id,
        squads: update_squads_stats(league.squads, data)
    }));
    await League.bulkCreate(leagueUpdates, {
        updateOnDuplicate: ['squads'],
    });
    const teamAbbreviations = {
        "Chennai Super Kings": "CSK",
        "Mumbai Indians": "MI",
        "Royal Challengers Bengaluru": "RCB",
        "Kolkata Knight Riders": "KKR",
        "Delhi Capitals": "DC",
        "Rajasthan Royals": "RR",
        "Punjab Kings": "PBKS",
        "Sunrisers Hyderabad": "SRH",
        "Lucknow Super Giants": "LSG",
        "Gujarat Titans": "GT"
    };
    for (const [team, abbreviation] of Object.entries(teamAbbreviations)) {
        data.result = data.result.replaceAll(team, abbreviation);
    }
    data.result = data.result.replaceAll('wkts', 'wickets');
    match.data = data;
    await match.save();
}

function base_points(player) {
    let batting_points = 0;
    let bowling_points = 0;
    let neutral_points = 0;

    const bowler = player.position == 'Pacer' || player.position == 'Spinner';
    const batsman = player.position == 'Batsman' || player.position == 'Wicketkeeper';

    batting_points += (bowler ? 2 : 1) * 2 * player.runs;
    batting_points += (bowler ? 2 : 1) * 4 * player.fours;
    batting_points += (bowler ? 2 : 1) * 8 * player.sixes;
    batting_points -= (bowler ? 0.5 : 1) * 6 * player.ducks;
    batting_points += (bowler ? 2 : 1) * 50 * player.half_centuries;
    batting_points += (bowler ? 2 : 1) * 150 * player.centuries;
    batting_points += (bowler ? 2 : 1) * 10 * player.not_outs;

    if (player.runs >= 850) {
        batting_points += (bowler ? 2 : 1) * 5000;
    } else if (player.runs >= 800) {
        batting_points += (bowler ? 2 : 1) * 4500;
    } else if (player.runs >= 750) {
        batting_points += (bowler ? 2 : 1) * 4000;
    } else if (player.runs >= 700) {
        batting_points += (bowler ? 2 : 1) * 3500;
    } else if (player.runs >= 650) {
        batting_points += (bowler ? 2 : 1) * 3000;
    } else if (player.runs >= 600) {
        batting_points += (bowler ? 2 : 1) * 2500;
    } else if (player.runs >= 550) {
        batting_points += (bowler ? 2 : 1) * 2000;
    } else if (player.runs >= 500) {
        batting_points += (bowler ? 2 : 1) * 1500;
    } else if (player.runs >= 450) {
        batting_points += (bowler ? 2 : 1) * 1000;
    } else if (player.runs >= 400) {
        batting_points += (bowler ? 2 : 1) * 750;
    } else if (player.runs >= 350) {
        batting_points += (bowler ? 2 : 1) * 500;
    } else if (player.runs >= 300) {
        batting_points += (bowler ? 2 : 1) * 250;
    }

    if (player.balls_faced >= 50) {
        if (player.strike_rate >= 250) {
            batting_points += (bowler ? 2 : 1) * 2000;
        } else if (player.strike_rate >= 235) {
            batting_points += (bowler ? 2 : 1) * 1500
        } else if (player.strike_rate >= 220) {
            batting_points += (bowler ? 2 : 1) * 1250
        } else if (player.strike_rate >= 205) {
            batting_points += (bowler ? 2 : 1) * 1000
        } else if (player.strike_rate >= 190) {
            batting_points += (bowler ? 2 : 1) * 750
        } else if (player.strike_rate >= 175) {
            batting_points += (bowler ? 2 : 1) * 500
        } else if (player.strike_rate >= 160) {
            batting_points += (bowler ? 2 : 1) * 250
        } else if (player.strike_rate >= 145) {
            batting_points += (bowler ? 2 : 1) * 100
        } else if (player.strike_rate >= 130) {
            batting_points += (bowler ? 2 : 1) * 0
        } else if (player.strike_rate >= 125) {
            batting_points -= (bowler ? 0.5 : 1) * 100
        } else if (player.strike_rate >= 120) {
            batting_points -= (bowler ? 0.5 : 1) * 200
        } else if (player.strike_rate >= 115) {
            batting_points -= (bowler ? 0.5 : 1) * 400;
        } else if (player.strike_rate >= 110) {
            batting_points -= (bowler ? 0.5 : 1) * 600; 
        } else if (player.strike_rate >= 105) {
            batting_points -= (bowler ? 0.5 : 1) * 800; 
        } else {
            batting_points -= (bowler ? 0.5 : 1) * 1000;
        }
    }

    bowling_points += (batsman ? 2 : 1) * 50 * player.wickets;
    bowling_points += (batsman ? 2 : 1) * 5 * player.dots;
    bowling_points += (batsman ? 2 : 1) * 150 * player.maidens;
    bowling_points += (batsman ? 2 : 1) * 750 * player.hat_tricks;
    bowling_points += (batsman ? 2 : 1) * 250 * player.four_wicket_hauls;
    bowling_points += (batsman ? 2 : 1) * 500 * player.five_wicket_hauls;
    bowling_points += (batsman ? 2 : 1) * 1000 * player.six_wicket_hauls;

    if (player.wickets > 35) {
        bowling_points += (batsman ? 2 : 1) * 5000;
    } else if (player.wickets > 30) {
        bowling_points += (batsman ? 2 : 1) * 4000;
    } else if (player.wickets > 25) {
        bowling_points += (batsman ? 2 : 1) * 3000;
    } else if (player.wickets > 20) {
        bowling_points += (batsman ? 2 : 1) * 2000;
    } else if (player.wickets > 15) {
        bowling_points += (batsman ? 2 : 1) * 1000;
    } else if (player.wickets > 10) {
        bowling_points += (batsman ? 2 : 1) * 500;
    }

    if (player.balls_bowled >= 30) {
        if (player.economy <= 5) {
            bowling_points += (batsman ? 2 : 1) * 2500;
        } else if (player.economy <= 5.5) {
            bowling_points += (batsman ? 2 : 1) * 2000;
        } else if (player.economy <= 6) {
            bowling_points += (batsman ? 2 : 1) * 1500;
        } else if (player.economy <= 7) {
            bowling_points += (batsman ? 2 : 1) * 1000;
        } else if (player.economy <= 7.5) {
            bowling_points += (batsman ? 2 : 1) * 500;
        } else if (player.economy <= 8) {
            bowling_points += (batsman ? 2 : 1) * 250;
        } else if (player.economy <= 8.5) {
            bowling_points += (batsman ? 2 : 1) * 100;
        } else if (player.economy <= 9.5) {
            bowling_points += (batsman ? 2 : 1) * 0;
        } else if (player.economy <= 10) {
            bowling_points -= (batsman ? 0.5 : 1) * 100;
        } else if (player.economy <= 10.5) {
            bowling_points -= (batsman ? 0.5 : 1) * 200;
        } else if (player.economy <= 11) {
            bowling_points -= (batsman ? 0.5 : 1) * 400;
        } else if (player.economy <= 11.5) {
            bowling_points -= (batsman ? 0.5 : 1) * 600;
        } else if (player.economy <= 12.5) {
            bowling_points -= (batsman ? 0.5 : 1) * 800;
        } else {
            bowling_points -= (batsman ? 0.5 : 1) * 1000;
        }
    }

    neutral_points += 25 * player.catches;
    neutral_points += 100 * player.stumpings;
    neutral_points += 100 * player.player_of_matches;

    return batting_points + bowling_points + neutral_points;
}

function update_squads_stats(squads, data) {
    for (const squad of squads) {
        for (const [name, player] of Object.entries(data.players)) {
            if (squad.players.find(member => member.name == name)) {
                squad.runs += player.runs;
                squad.fours += player.fours;
                squad.sixes += player.sixes;
                squad.ducks += player.out && player.runs == 0 ? 1 : 0;
                squad.half_centuries += 50 <= player.runs && player.runs < 100 ? 1 : 0;
                squad.centuries += player.runs > 100 ? 1 : 0;
                squad.balls_faced += player.balls_faced;
                squad.not_outs += player.not_out ? 1 : 0;
                squad.dismissals += player.out ? 1 : 0;
                squad.highest_score = player.highest_score > squad.highest_score ? player.highest_score : squad.highest_score;
                squad.wickets += player.wickets;
                squad.dots += player.dots;
                squad.four_wicket_hauls += player.wickets == 4 ? 1 : 0;
                squad.five_wicket_hauls += player.wickets == 5 ? 1 : 0;
                squad.six_wicket_hauls += player.wickets == 6 ? 1 : 0;
                squad.maidens += player.maidens;
                squad.hat_tricks += player.hat_tricks;
                squad.balls_bowled += player.balls_bowled;
                squad.runs_conceded += player.runs_conceded;
                squad.catches += player.catches;
                squad.stumpings += player.stumpings;
                squad.player_of_matches += player.player_of_match ? 1 : 0;
            }
        }
        squad.strike_rate = 100 * squad.runs / (squad.balls_faced > 0 ? squad.balls_faced : 1);
        squad.batting_average = squad.runs / (squad.dismissals > 0 ? squad.dismissals : 1);
        squad.economy = 6 * squad.runs_conceded / (squad.balls_bowled > 0 ? squad.balls_bowled : 1);
        squad.bowling_average = squad.runs_conceded / (squad.wickets > 0 ? squad.wickets : 1);
        squad.bowling_strike_rate = squad.balls_bowled / (squad.wickets > 0 ? squad.wickets : 1);
    }
    return squads;
}

async function update_players() {
    const players = await Player.findAll();
    for (const player of players) {
        player.points = player.base_points + player.bonus_points;
    }
    const updates = players.map((player) => ({
        id: player.id,
        points: player.points
    }));
    await Player.bulkCreate(updates, {
        updateOnDuplicate: ['points'],
    });
}

async function update_leagues() {
    const leagues = await League.findAll();
    const players = await Player.findAll();
    const map = players.reduce((entry, data) => {
        entry[data.name] = data.points;
        return entry;
    }, {});
    for (const league of leagues) {
        for (const squad of league.squads) {
            squad.base_points = 0;
            for (const player of squad.players) {
                if (player.name == squad.captain) {
                    squad.base_points += 2 * map[player.name];
                } else if (player.name == squad.vice_captain) {
                    squad.base_points += 1.5 * map[player.name];
                } else {
                    squad.base_points += map[player.name];
                }
            }
            squad.points = Math.round(squad.base_points + squad.bonus_points);
        }
    }
    const updates = leagues.map((league) => ({
        id: league.id,
        squads: league.squads
    }));
    await League.bulkCreate(updates, {
        updateOnDuplicate: ['squads'],
    });
}

async function add_bonus(property, most, batting_threshold, bowling_threshold, value, batting, bowling) {
    const best = await Player.findOne({
        order: most
            ? [[property, 'DESC']]
            : [[property, 'ASC']],
        limit: 1,
        where: {
            'balls_faced': {
                [Op.gt]: batting_threshold ? 50 : -1
            },
            'balls_bowled': {
                [Op.gt]: bowling_threshold ? 30 : -1
            }
        }
    });

    const receivers = await Player.findAll({ where: {
            [property]: best[property],
            'balls_faced': {
                [Op.gt]: batting_threshold ? 50 : -1
            },
            'balls_bowled': {
                [Op.gt]: bowling_threshold ? 30 : -1
            }
        }
    });

    const updates = [];
    for (const player of receivers) {
        let amount = value[property] / receivers.length;
        if (batting && (player.position == 'Pacer' || player.position == 'Spinner')) {
            if (amount > 0.0) {
                amount *= 2;
            } else {
                amount *= 0.5;
            }
        }
        if (bowling && (player.position == 'Batsman' || player.position == 'Wicketkeeper')) {
            if (amount > 0.0) {
                amount *= 2;
            } else {
                amount *= 0.5;
            }
        }
        amount = Math.round(amount);
        player.bonuses.push({
            [property]: amount
        });
        player.bonus_points += amount;
        player.points = player.base_points + player.bonus_points;
        updates.push({
            id: player.id,
            bonuses: player.bonuses,
            bonus_points: player.bonus_points,
            points: player.points
        });
    }

    await Player.bulkCreate(updates, {
        updateOnDuplicate: ['bonuses', 'bonus_points', 'points'],
    });
}

function add_league_bonuses(squads, value) {
    for (const squad of squads) {
        squad.bonuses = [];
        squad.bonus_points = 0;
    }
    for (const bonus of Object.keys(value)) {
        if (bonus != 'highest_score') {
            squads = add_league_bonus(
                squads,
                bonus, 
                bonus != 'bowling_average' && bonus != 'bowling_strike_rate' && bonus != 'economy',
                bonus == 'strike_rate' || bonus == 'batting_average', 
                bonus == 'bowling_average' || bonus == 'bowling_strike_rate' || bonus == 'economy', 
                value
            );
        }
    }
    return squads;
}

function add_league_bonus(squads, property, most, batting_threshold, bowling_threshold, value) {
    let receivers = [];
    let best = most ? -Number.MAX_VALUE : Number.MAX_VALUE;
    for (const squad of squads) {
        if (most) {
            if (squad[property] > best && squad.balls_faced > (batting_threshold ? 50 : -1)) {
                best = squad[property];
                receivers = [squad];
            } else if (squad[property] == best && squad.balls_faced > (batting_threshold ? 50 : -1)) {
                receivers.push(squad);
            }
        } else {
            if (squad[property] < best && squad.balls_bowled > (bowling_threshold ? 30 : -1)) {
                best = squad[property];
                receivers = [squad];
            } else if (squad[property] == best && squad.balls_bowled > (bowling_threshold ? 30 : -1)) {
                receivers.push(squad);
            }
        }
    }
    const amount = 2 * value[property] / receivers.length;
    for (const squad of receivers) {
        squad.bonuses.push({
            [property]: amount
        });
        squad.bonus_points += amount;
    }
    return squads;
}


const reset_players = async (req, res) => {
    try {
        await Player.update({
            base_points: 0,
            bonus_points: 0,
            points: 0,
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
            highest_score: 0,
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
        }, {
            where: {},
        });
        res.status(200).json({});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

const reset_leagues = async (req, res) => {
    try {
        const leagues = await League.findAll();
        for (const league of leagues) {
            for (const squad of league.squads) {
                squad.runs = 0;
                squad.fours = 0;
                squad.sixes = 0;
                squad.ducks = 0;
                squad.half_centuries = 0;
                squad.centuries = 0;
                squad.balls_faced = 0;
                squad.not_outs = 0;
                squad.dismissals = 0;
                squad.highest_score = 0;
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
                squad.strike_rate = 0;
                squad.batting_average = 0;
                squad.economy = 0;
                squad.bowling_average = 0;
                squad.bowling_strike_rate = 0;
            }
        }
        const updates = leagues.map((league) => ({
            id: league.id,
            squads: league.squads
        }));
        await League.bulkCreate(updates, {
            updateOnDuplicate: ['squads'],
        });
        return res.status(200).json();
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

const add_player = async (req, res) => {
    const {
        name,
        position,
        team,
        foreigner
    } = req.body;

    try {
        const player = await Player.create({
            name: name,
            position: position,
            team: team,
            foreigner: foreigner,
            base_points: 0,
            bonus_points: 0,
            bonuses: [],
            points: 0,
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
            highest_score: 0,
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
        });
        res.status(200).json(player);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const add_matches = async (req, res) => {
    const {
        matches
    } = req.body;

    try {
        for (const match of matches) {
            await Match.create({
                match_id: match
            });
        }
        res.status(200).json({});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    update,
    add_player,
    add_matches,
    reset_players,
    reset_leagues
}