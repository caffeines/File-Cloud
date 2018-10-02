const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserFileSchema = new Schema({
    email: {
        type: String,
        required: true,
        minLength: 6
    },
    fileId: {
        type: String,
        required: true,
    },
});
module.exports = mongoose.model('userFile', UserFileSchema);