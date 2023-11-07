const mongoose = require('mongoose');
const userSchema = require('./schemas/user');
const sessionSchema = require('./schemas/session');
const gemSchema = require('./schemas/gem');

const wizardSchema = new mongoose.Schema({
    user: {
        required: true,
        type: userSchema
    },
    magicKey: {
        required: true,
        type: String
    },
    sessions: [{
        required: true,
        type: sessionSchema
    }],
    vault: [{
        required: true,
        type: gemSchema
    }]
}, {versionKey: false})

module.exports = mongoose.model('Wizard', wizardSchema);
