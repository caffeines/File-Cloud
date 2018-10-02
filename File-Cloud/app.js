// Express conection
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const session = require('express-session');
const port = process.env.PORT || 8080;

// Embedded JavaScript templates
app.set('view engine', 'ejs');
app.use(express.static('public'));

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
app.use('/upload', main);
app.use('/files', main);
app.use('/delete', main);
app.use('/view', main);
app.use('/download', main);

app.listen(port);