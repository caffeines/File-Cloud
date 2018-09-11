const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { mongoURL } = require('../config/database');
const autoIncrement = require('mongoose-auto-increment');
const { conn } = require('../config/mongoDB');
autoIncrement.initialize(conn);
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        minLength: 6
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },

    password: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    dateOFRegistration: {
        type: String,
        required: true,
    }

});
UserSchema.plugin(autoIncrement.plugin, 'user');
module.exports = mongoose.model('user', UserSchema);