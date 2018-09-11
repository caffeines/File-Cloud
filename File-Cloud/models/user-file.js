const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserFileSchema = new Schema({
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
});
module.exports = mongoose.model('userFile', UserFileSchema);