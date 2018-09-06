// Express conection
var express = require('express');
var app = express();
const session = require('express-session')
    // importing config/databse
const { mongoURL } = require('./config/database');

// Embedded JavaScript templates
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('views'));

// MongoDB Connection
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(mongoURL, {
    useNewUrlParser: true
});
mongoose.connection
    .once('open', () => console.log('** MongoDB connected successfully -_- **'))
    .on('error', err => {
        throw err;
    });

// Body-Parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//imorting passport
const passport = require('passport');
const flash = require("connect-flash");

// use passport
app.use(session({
    secret: '{secret}',
    name: 'session_id',
    saveUninitialized: true,
    resave: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



// Load router
const main = require('./routes/home/main');

// Use Router
app.use('/', main);
app.use('/signup', main);
app.use('/login', main);
app.use('/enter', main);

app.listen(3000);