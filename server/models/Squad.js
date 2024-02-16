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
        required: true
    },
    players: {
        type: [String],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Squad', squadSchema);