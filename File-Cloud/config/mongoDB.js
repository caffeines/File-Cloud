const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
module.exports = {

    mongoose.connect(mongoURL, {
        useNewUrlParser: true
    });
    mongoose.connection
    .once('open', () => console.log('** MongoDB connected successfully -_- **'))
    .on('error', err => {
        throw err;
    });
}