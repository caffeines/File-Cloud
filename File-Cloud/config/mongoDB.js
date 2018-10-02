const mongoose = require('mongoose');
const { mongoURL } = require('./database');

// MongoDB Connection
mongoose.Promise = global.Promise;
mongoose.connect(mongoURL, {
    useNewUrlParser: true
});
mongoose.connection
    .once('open', () => console.log('** MongoDB connected successfully -_- **'))
    .on('error', err => {
        throw err;
    });

module.exports = {
    conn: mongoose.connection
}