const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const squadSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    league: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    players: {
        type: [String],
        required: true,
        default: []
    },
    bonuses: {
        type: [String],
        required: true,
        default: []
    },
    batting_average: {
        type: Number,
        required: true,
        default: 0
    },
    strike_rate: {
        type: Number,
        required: true,
        default: 0
    },
    highest_score: {
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
    not_outs: {
        type: Number,
        required: true,
        default: 0
    },
    ducks: {
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
    maidens: {
        type: Number,
        required: true,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model('Squad', squadSchema);