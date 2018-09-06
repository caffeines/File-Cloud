// Importing
const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//userAuthentication checker
const { userAuthenticated } = require('../../helpers/authentication');

//Schema 
const User = require('../../models/User');

// Landing page 
router.get('/', function(req, res) {
    res.sendfile('./Views/landing.html');
});

// enter page  
router.get('/enter/:name', userAuthenticated, function(req, res) {
    res.render('../views/home/index1');
});

// Login
passport.use(new LocalStrategy({
    usernameField: 'email'

}, (email, password, done) => {
    //console.log('No user found');
    User.findOne({
        email: email
    }).then(user => {
        if (!user) return done(null, false, {
            message: 'No user found'
        });

        bcrypt.compare(password, user.password, (err, matched) => {
            if (err) return err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Incorrect Password'
                });
            }
        })
    })

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login', (req, res, next) => {
    User.findOne({
        email: req.body.email
    }).then(users => {
        if (users != null && users.email == req.body.email) {
            var id = users._id;
            passport.authenticate('local', {
                successRedirect: '/enter/' + id,
                failureRedirect: '/',
                failureFlash: true
            })(req, res, next);
        }
    });
});

// logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Create a Transport instance using nodemailer
var nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        type: "OAuth2",
        user: "me.caffeines@gmail.com", // Your gmail address.
        clientId: "65590644875-5na2q9q6k5qhrlkbjvet36shgmn9c5ls.apps.googleusercontent.com",
        clientSecret: "y3RKBgm1008bjQk8vvGNIuFe",
        refreshToken: "1/uaE5RS0H_o68oXneH9MFo2uGUY_MPhh5w8T9_sLWEZi6QrEchXTToVpy1Xv1udEY"
    }
});
// Date time
const datetime = require('node-datetime');
const dt = datetime.create();
// Sign up here
router.post('/signup', (req, res) => {

    User.findOne({
        email: req.body.email
    }).then(users => {
        if (users != null && users.email == req.body.email) {
            res.send(`This email already exist`);
        } else {
            const newUser = new User({
                email: req.body.email,
                name: req.body.name,
                password: req.body.pass,
                position: 123,
                dateOFRegistration: dt.format('m/d/Y H:M:S')
            });
            // bcrypt js - for hassing password
            bcrypt.genSalt(10, (err, sallt) => {
                bcrypt.hash(newUser.password, sallt, (err, hash) => {
                    newUser.password = hash;

                    //newUser saving here
                    newUser.save().then(saveUser => {
                        res.redirect('./login');
                    }).catch(err => {
                        res.status(404).send('NOT SAVED');
                        throw err;
                    });
                });
            });


            // Setup mail configuration
            var mailOptions = {
                from: 'Team74<me.caffeines@gmail.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Confirmation message', // Subject line
                html: "<h1> <br>Thanks for Registration<br><br></h1><h4>From<br>Abu Sadat Md. Sayem<br>Team lead, Team74</h4>" // html body
            };

            // send mail
            smtpTransport.sendMail(mailOptions, function(error, info) {
                if (error) {
                    throw error;
                    return res.notOk({
                        status: 'error',
                        msg: 'Email sending failed'
                    })
                } else {
                    console.log('Message %s sent: %s', info.messageId, info.response);
                    return res.ok({
                        status: 'ok',
                        msg: 'Email sent'
                    })
                }
                //smtpTransport.close();
            });
        }
    });
});



module.exports = router;