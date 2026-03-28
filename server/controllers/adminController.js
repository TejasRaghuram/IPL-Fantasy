require('dotenv').config();

const { Player, Match, League, Squad } = require('../models');
const { Op, Sequelize } = require('sequelize');

const update = async (req, res) => {
    const {
        match_id,
        team1,
        score1,
        team2,
        score2,
        result,
        stadium,
        player_of_match,
        scorecard
    } = req.body;

    try {
        const match = await Match.findOne({ where: { match_id: match_id } });
        match.team1 = team1;
        match.team1_score = score1;
        match.team2 = team2;
        match.team2_score = score2;
        match.result = result;
        match.stadium = stadium;
        match.player_of_match = player_of_match;
        match.scorecard = scorecard;
        await match.save();

        const players = await Player.findAll({});
        const map = {};
        for (const player of players) {
            map[player.name] = player;
            map[player.name].bonuses = [];
            map[player.name].bonus_points = 0;
            map[player.name].runs = 0;
            map[player.name].fours = 0;
            map[player.name].sixes = 0;
            map[player.name].ducks = 0;
            map[player.name].half_centuries = 0;
            map[player.name].centuries = 0;
            map[player.name].balls_faced = 0;
            map[player.name].not_outs = 0;
            map[player.name].dismissals = 0;
            map[player.name].highest_score = 0;
            map[player.name].wickets = 0;
            map[player.name].dots = 0;
            map[player.name].four_wicket_hauls = 0;
            map[player.name].five_wicket_hauls = 0;
            map[player.name].six_wicket_hauls = 0;
            map[player.name].maidens = 0;
            map[player.name].hat_tricks = 0;
            map[player.name].balls_bowled = 0;
            map[player.name].runs_conceded = 0;
            map[player.name].catches = 0;
            map[player.name].stumpings = 0;
            map[player.name].player_of_matches = 0;
        }

        const matches = await Match.findAll({
            where: Sequelize.literal("scorecard::jsonb <> '{}'::jsonb")
        });

        const not_found = [];

        for (const match of matches) {
            if (match.player_of_match in map) map[match.player_of_match].player_of_matches++;
            else not_found.push(match.player_of_match);
            for (const [player, stats] of Object.entries(match.scorecard)) {
                if (!(player in map)) {
                    not_found.push(player);
                    continue;
                }

                map[player].runs += stats.runs;
                map[player].fours += stats.fours;
                map[player].sixes += stats.sixes;
                map[player].ducks += stats.out && stats.runs == 0 ? 1 : 0;
                map[player].half_centuries += stats.runs >= 50 && stats.runs < 100 ? 1 : 0;
                map[player].centuries += stats.runs >= 100 ? 1 : 0;
                map[player].balls_faced += stats.balls_faced;
                map[player].not_outs += stats.not_out ? 1 : 0;
                map[player].dismissals += stats.out ? 1 : 0;
                map[player].highest_score = Math.max(map[player].highest_score, stats.runs);
                map[player].wickets += stats.wickets;
                map[player].dots += stats.dots;
                map[player].four_wicket_hauls += stats.wickets == 4 ? 1 : 0;
                map[player].five_wicket_hauls += stats.wickets == 5 ? 1 : 0;
                map[player].six_wicket_hauls += stats.wickets == 6 ? 1 : 0;
                map[player].maidens += stats.maidens;
                map[player].hat_tricks += stats.hat_tricks;
                map[player].balls_bowled += stats.balls_bowled;
                map[player].runs_conceded += stats.runs_conceded;
                map[player].catches += stats.catches;
                map[player].stumpings += stats.stumpings;
            }
        }

        for (const player of Object.keys(map)) {
            map[player].base_points = base_points(map[player]);
            map[player].strike_rate = map[player].balls_faced > 0 ? 100 * map[player].runs / map[player].balls_faced : 0;
            map[player].batting_average = map[player].dismissals > 0 ? map[player].runs / map[player].dismissals : map[player].runs;
            map[player].economy = map[player].balls_bowled > 0 ? 6 * map[player].runs_conceded / map[player].balls_bowled : map[player].runs_conceded;
            map[player].bowling_average = map[player].wickets > 0 ? map[player].runs_conceded / map[player].wickets : map[player].runs_conceded;
            map[player].bowling_strike_rate = map[player].wickets > 0 ? map[player].balls_bowled / map[player].wickets : map[player].balls_bowled;
        }

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

        for (const [bonus, value] of Object.entries(bonuses)) {
            const most = bonus != 'bowling_average' && bonus != 'bowling_strike_rate' && bonus != 'economy';
            const batting_threshold = bonus == 'strike_rate' || bonus == 'batting_average';
            const bowling_threshold = bonus == 'bowling_average' || bonus == 'bowling_strike_rate' || bonus == 'economy';
            const batting = ['runs', 'bating_average', 'strike_rate', 'centuries', 'half_centuries', 'highest_score', 'sixes', 'fours', 'not_outs', 'ducks'].includes(bonus);
            const bowling = ['wickets', 'bowling_average', 'bowling_strike_rate', 'economy', 'four_wicket_hauls', 'five_wicket_hauls', 'six_wicket_hauls', 'hat_tricks', 'maidens', 'dots'].includes(bonus);
            let best = most ? Number.MIN_VALUE : Number.MAX_VALUE;
            for (const stats of Object.values(map))
                if ((!batting_threshold || stats.balls_faced >= 50) &&
                    (!bowling_threshold || stats.balls_bowled >= 30))
                    best = most ? Math.max(best, stats[bonus]) : Math.min(best, stats[bonus]);
            best = Math.round(best * 1e10) / 1e10;
            if (best == 0 && most) best = Number.MAX_VALUE;
            const to_add = []
            for (const player of Object.keys(map)) {
                if ((!batting_threshold || map[player].balls_faced >= 50) &&
                    (!bowling_threshold || map[player].balls_bowled >= 30) &&
                    Math.round(map[player][bonus] * 1e10) / 1e10 == best)  {
                    to_add.push(player);
                }
            }
            for (const player of to_add) {
                let points = (((batting && (map[player].position == 'Pacer' || map[player].position == 'Spinner')) ||
                        (bowling && (map[player].position == 'Batsman' || map[player].position == 'Wicketkeeper'))) ? 2 : 1) * value / to_add.length;
                if (bonus == 'ducks' && (map[player].position == 'Pacer' || map[player].position == 'Spinner')) points /= 4;
                map[player].bonuses = [...map[player].bonuses, {[bonus]: Math.round(points)}];
                map[player].bonus_points += Math.round(points);
            }
        }

        for (const player of Object.keys(map)) map[player].points = map[player].base_points + map[player].bonus_points;

        await Promise.all(players.map(player => player.save()));

        const squads = await Squad.findAll({});

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

        const leagues = await League.findAll({});

        for (const league of leagues) {
            for (const [bonus, value] of Object.entries(bonuses)) {
                const most = bonus != 'bowling_average' && bonus != 'bowling_strike_rate' && bonus != 'economy';
                const batting_threshold = bonus == 'strike_rate' || bonus == 'batting_average';
                const bowling_threshold = bonus == 'bowling_average' || bonus == 'bowling_strike_rate' || bonus == 'economy';
                let best = most ? Number.MIN_VALUE : Number.MAX_VALUE;
                for (const squad of squads)
                    if (squad.league == league.name &&
                        (!batting_threshold || squad.balls_faced >= 50) &&
                        (!bowling_threshold || squad.balls_bowled >= 30))
                        best = most ? Math.max(best, squad[bonus]) : Math.min(best, squad[bonus]);
                best = Math.round(best * 1e10) / 1e10;
                if (best == 0 && most) best = Number.MAX_VALUE;
                const to_add = new Set();
                for (const squad of squads) {
                    if (squad.league == league.name &&
                        (!batting_threshold || squad.balls_faced >= 50) &&
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
        }

        for (const squad of squads) squad.points = squad.base_points + squad.bonus_points;

        await Promise.all(squads.map(squad => squad.save()));

        res.status(200).json({
            not_found: not_found.filter(item => item !== '-')
        });
    } catch(error) {
        res.status(400).json({error: error.message});
    }
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
        if (player.strike_rate >= 265) {
            batting_points += (bowler ? 2 : 1) * 2000;
        } else if (player.strike_rate >= 250) {
            batting_points += (bowler ? 2 : 1) * 1500
        } else if (player.strike_rate >= 235) {
            batting_points += (bowler ? 2 : 1) * 1250
        } else if (player.strike_rate >= 220) {
            batting_points += (bowler ? 2 : 1) * 1000
        } else if (player.strike_rate >= 205) {
            batting_points += (bowler ? 2 : 1) * 750
        } else if (player.strike_rate >= 190) {
            batting_points += (bowler ? 2 : 1) * 500
        } else if (player.strike_rate >= 175) {
            batting_points += (bowler ? 2 : 1) * 250
        } else if (player.strike_rate >= 160) {
            batting_points += (bowler ? 2 : 1) * 100
        } else if (player.strike_rate >= 145) {
            batting_points += (bowler ? 2 : 1) * 0
        } else if (player.strike_rate >= 140) {
            batting_points -= (bowler ? 0.5 : 1) * 100
        } else if (player.strike_rate >= 135) {
            batting_points -= (bowler ? 0.5 : 1) * 200
        } else if (player.strike_rate >= 130) {
            batting_points -= (bowler ? 0.5 : 1) * 400;
        } else if (player.strike_rate >= 125) {
            batting_points -= (bowler ? 0.5 : 1) * 600; 
        } else if (player.strike_rate >= 120) {
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

    if (player.wickets >= 35) {
        bowling_points += (batsman ? 2 : 1) * 5000;
    } else if (player.wickets >= 30) {
        bowling_points += (batsman ? 2 : 1) * 4000;
    } else if (player.wickets >= 25) {
        bowling_points += (batsman ? 2 : 1) * 3000;
    } else if (player.wickets >= 20) {
        bowling_points += (batsman ? 2 : 1) * 2000;
    } else if (player.wickets >= 15) {
        bowling_points += (batsman ? 2 : 1) * 1000;
    } else if (player.wickets >= 10) {
        bowling_points += (batsman ? 2 : 1) * 500;
    }

    if (player.balls_bowled >= 30) {
        if (player.economy <= 5) {
            bowling_points += (batsman ? 2 : 1) * 3000;
        } else if (player.economy <= 5.5) {
            bowling_points += (batsman ? 2 : 1) * 2500;
        } else if (player.economy <= 6) {
            bowling_points += (batsman ? 2 : 1) * 2000;
        } else if (player.economy <= 6.5) {
            bowling_points += (batsman ? 2 : 1) * 1500;
        } else if (player.economy <= 7) {
            bowling_points += (batsman ? 2 : 1) * 1000;
        } else if (player.economy <= 7.5) {
            bowling_points += (batsman ? 2 : 1) * 750;
        } else if (player.economy <= 8) {
            bowling_points += (batsman ? 2 : 1) * 500;
        } else if (player.economy <= 8.5) {
            bowling_points += (batsman ? 2 : 1) * 250;
        } else if (player.economy <= 9) {
            bowling_points += (batsman ? 2 : 1) * 100;
        } else if (player.economy <= 10) {
            bowling_points += (batsman ? 2 : 1) * 0;
        } else if (player.economy <= 10.5) {
            bowling_points -= (batsman ? 0.5 : 1) * 100;
        } else if (player.economy <= 11) {
            bowling_points -= (batsman ? 0.5 : 1) * 200;
        } else if (player.economy <= 11.5) {
            bowling_points -= (batsman ? 0.5 : 1) * 300;
        } else if (player.economy <= 12) {
            bowling_points -= (batsman ? 0.5 : 1) * 400;
        } else if (player.economy <= 12.5) {
            bowling_points -= (batsman ? 0.5 : 1) * 600;
        } else if (player.economy <= 13) {
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

const matches = async (req, res) => {
    try {
        const matches = await Match.findAll({
            order: [
                ['date', 'DESC']
            ],
            where: Sequelize.literal("scorecard::jsonb <> '{}'::jsonb")
        });
        res.status(200).json(matches);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

const current = async (req, res) => {
    try {
        await Match.update(
            { result: 'LIVE' },
            {
                where: {
                result: '-',
                date: {
                    [Op.lt]: new Date()
                }
                }
            }
        );

        const matches = await Match.findAll({
            where: {
                result: 'LIVE'
            },
            attributes: ['match_id']
        });
        const matchIds = matches.map(m => m.match_id);

        res.status(400).json(matchIds);
    } catch (error) {
        res.status(400).json({error: error.message});
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
            image: 'https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/'
              + name.replaceAll(' ', '%20') + '.png',
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
                match_id: match.match_id,
                title: match.title,
                stadium: '-',
                team1: '-',
                team2: '-',
                team1_score: '-',
                team2_score: '-',
                date: match.date,
                scorecard: {},
                result: '-'
            });
        }
        res.status(200).json({});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

const test = async (req, res) => {
    try {
        const batsmen = await Player.findAll({
            where: {
                position: {
                    [Op.in]: ['Batsman', 'Wicketkeeper']
                },
                points: {
                    [Op.ne]: 0
                }
            }
        });
        const bowlers = await Player.findAll({
            where: {
                position: {
                    [Op.in]: ['Pacer', 'Spinner']
                },
                points: {
                    [Op.ne]: 0
                }
            }
        });
        const all_rounders = await Player.findAll({
            where: {
                position: 'All Rounder',
                points: {
                    [Op.ne]: 0
                }
            }
        });
        res.status(400).json({
            batsmen: {
                amount: batsmen.length,
                average: batsmen.reduce((sum, player) => sum + player.points, 0) / batsmen.length,
                median: batsmen.length ? ((s => s.length % 2 ? s[Math.floor(s.length/2)] : (s[s.length/2 - 1] + s[s.length/2]) / 2)(batsmen.map(p => p.points).sort((a,b)=>a-b))) : 0
            },
            bowlers: {
                amount: bowlers.length,
                average: bowlers.reduce((sum, player) => sum + player.points, 0) / bowlers.length,
                median: bowlers.length ? ((s => s.length % 2 ? s[Math.floor(s.length/2)] : (s[s.length/2 - 1] + s[s.length/2]) / 2)(bowlers.map(p => p.points).sort((a,b)=>a-b))) : 0
            },
            all_rounders: {
                amount: all_rounders.length,
                average: all_rounders.reduce((sum, player) => sum + player.points, 0) / all_rounders.length,
                median: all_rounders.length ? ((s => s.length % 2 ? s[Math.floor(s.length/2)] : (s[s.length/2 - 1] + s[s.length/2]) / 2)(all_rounders.map(p => p.points).sort((a,b)=>a-b))) : 0
            },
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    update,
    matches,
    current,
    add_player,
    add_matches,
    test
}