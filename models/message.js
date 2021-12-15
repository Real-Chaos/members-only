const mongoose = require('mongoose');
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
    }
}, {timestamps: true})

const Message = mongoose.model('Message', MessageSchema)
module.exports = Message