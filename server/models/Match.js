const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const matchSchema = new Schema({
    match_id: {
        type: Number,
        required: true
    },
    source: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);