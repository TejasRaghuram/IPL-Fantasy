const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    base_points: {
        type: Number,
        required: true,
        default: 0
    },
    bonuses: {
        type: [String],
        required: true,
        default: []
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    runs: {
        type: Number,
        required: true,
        default: 0
    },
    fours: {
        type: Number,
        required: true,
        default: 0
    },
    sixes: {
        type: Number,
        required: true,
        default: 0
    },
    ducks: {
        type: Number,
        required: true,
        default: 0
    },
    half_centuries: {
        type: Number,
        required: true,
        default: 0
    },
    centuries: {
        type: Number,
        required: true,
        default: 0
    },
    strike_rate: {
        type: Number,
        required: true,
        default: 0
    },
    balls_faced: {
        type: Number,
        required: true,
        default: 0
    },
    batting_average: {
        type: Number,
        required: true,
        default: 0
    },
    not_outs: {
        type: Number,
        required: true,
        default: 0
    },
    dismissals: {
        type: Number,
        required: true,
        default: 0
    },
    highest_score: {
        type: Number,
        required: true,
        default: 0
    },
    wickets: {
        type: Number,
        required: true,
        default: 0
    },
    dots: {
        type: Number,
        required: true,
        default: 0
    },
    four_wicket_hauls: {
        type: Number,
        required: true,
        default: 0
    },
    five_wicket_hauls: {
        type: Number,
        required: true,
        default: 0
    },
    six_wicket_hauls: {
        type: Number,
        required: true,
        default: 0
    },
    maidens: {
        type: Number,
        required: true,
        default: 0
    },
    hat_tricks: {
        type: Number,
        required: true,
        default: 0
    },
    economy: {
        type: Number,
        required: true,
        default: 0
    },
    bowling_average: {
        type: Number,
        required: true,
        default: 0
    },
    balls_bowled: {
        type: Number,
        required: true,
        default: 0
    },
    runs_conceded: {
        type: Number,
        required: true,
        default: 0
    },
    catches: {
        type: Number,
        required: true,
        default: 0
    },
    stumpings: {
        type: Number,
        required: true,
        default: 0
    },
    man_of_matches: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);