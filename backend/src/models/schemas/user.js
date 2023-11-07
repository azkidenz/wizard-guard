const {Schema} = require("mongoose");

const userSchema = new Schema({
    name: {
        firstName: {
            required: true,
            type: String
        },
        lastName: {
            required: true,
            type: String
        }
    },
    email: {type: String, unique: true},
    masterPassword: {
        value: {
            required: true,
            type: String
        },
        salt: {
            required: true,
            type: String
        }
    },
    isActive: {type: Boolean, default: false},
    validationToken: {type: String},
    isEnabled: {type: Boolean, default: true},
    creationTimestamp: {type: Date, default: Date.now()}
}, { _id : false });

module.exports = userSchema;