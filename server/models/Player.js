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
    points: {
        type: Number,
        required: true
    },
    runs: {
        type: Number,
        required: true
    },
    wickets: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);