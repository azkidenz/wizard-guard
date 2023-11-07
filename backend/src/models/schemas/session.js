const {Schema} = require("mongoose");

const sessionSchema = new Schema({
    id: {
        required: true,
        type: Schema.ObjectId
    },
    location: {
        required: true,
        type: String,
        minLength: 2,
        maxLength: 2
    },
    userAgent: {
        device: {
            required: true,
            type: String
        },
        client: {
            required: true,
            type: String
        },
        type: {
            required: true,
            type: String,
            enum: ['web','mobile', 'unknown'],
            default: 'web'
        }
    },
    refreshToken: {
        value: {
            required: true,
            type: String
        },
        expiration: {
            required: true,
            type: Date
        }
    },
}, { _id : false });

module.exports = sessionSchema;