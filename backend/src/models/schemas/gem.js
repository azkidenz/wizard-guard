const {Schema} = require("mongoose");

const gemSchema = new Schema({
    id: {
        required: true,
        type: Schema.ObjectId
    },
    value: {
        required: true,
        type: String
    },
    updatedAt: {
        required: true,
        type: String,
    }
}, { _id : false });

module.exports = gemSchema;