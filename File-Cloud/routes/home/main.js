// Importing
const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const path = require('path');
const { conn } = require('../../config/mongoDB');
const { mongoURL } = require('../../config/database');
const mongoose = require('mongoose');
const dir = require('../../helpers/dir');
const US = require('../../helpers/user');
const fs = require('file-system');
var jwt = require('jsonwebtoken');




//userAuthentication checker
const { userAuthenticated } = require('../../helpers/authentication');

//Schema 
const User = require('../../models/User');
const UserFile = require('../../models/user-file');


// Landing page 
router.get('/', function(req, res) {
    res.sendfile('./Views/landing.html');
});

var Dir = new dir('');
// enter page  
router.get('/enter/:id', userAuthenticated, function(req, res) {
    if (userAuthenticated) {
        let id = req.params.id;
        Dir.setDir('' + id);

        User.findById({ _id: id }).then(user => {
            const name = user.name;
            var gfs = Grid(conn.db, mongoose.mongo);
            let str = '' + Dir.getDir();
            gfs.collection(str);
            //console.log(gfs);


            gfs.files.find().toArray(function(err, files) {
                if (!files || files.length === 0) {
                    res.render('../views/home/index', {
                        name: name,
                        id: id,
                        files: false,
                    });
                } else {
                    res.render('../views/home/index', {
                        name: name,
                        id: id,
                        files: files,
                    });
                }
            })
        })
    } else {
        res.redirect('/login');
    }
});

// Login
passport.use(new LocalStrategy({
    usernameField: 'email'

}, (email, password, done) => {
    //console.log('No user found');
    User.findOne({
        email: email
    }).then(user => {
        if (!user) {
            return done(null, false, {
                message: 'No user found'
            });
        }

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
            jwt.sign({ user: users }, 'secretkey', (err, token) => {

            });
            passport.authenticate('local', {
                successRedirect: '/enter/' + id,
                failureRedirect: '/login',
                failureFlash: true
            })(req, res, next);
        } else {
            res.redirect('/login');
        }

    });
});

// Verify Token

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(404);
    }
}

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
                    if (err) throw err;
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

// Init gfs
// Create storage engine
var storage = new GridFsStorage({
    url: mongoURL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {

            const filename = dt.format('dmyHMS') + file.originalname;
            const fileInfo = {
                filename: filename,
                bucketName: Dir.getDir()
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({
    storage
});
// Upload files
router.post('/:id/upload', userAuthenticated, upload.single('file'), (req, res) => {
    let id = req.params.id;
    res.redirect('/enter/' + id);
});

router.get('/files', userAuthenticated, (req, res) => {
    var gfs = Grid(conn.db, mongoose.mongo);
    let str = '' + Dir.getDir();
    gfs.collection(str);
    gfs.files.find().toArray(function(err, files) {
        res.json(files);
    })
});

router.get('/view/:id', userAuthenticated, (req, res) => {
    var gfs = Grid(conn.db, mongoose.mongo);
    let str = '' + Dir.getDir();
    gfs.collection(str);
    console.log(req.params.filename);

    gfs.files.findOne({
        filename: req.params.id,
        //_id: req.params.id,
    }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exist' });
        } else {
            console.log('------------------------------------');
            console.log(file.filename);
            console.log('------------------------------------');
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
    })
})

router.get('/delete/:id', userAuthenticated, (req, res) => {
    const gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection(Dir.getDir());


    gfs.remove({
        _id: req.params.id,
        root: Dir.getDir()
    }, (err, gridStore) => {
        if (err) handleError(err);
        else {
            res.redirect('/enter/' + Dir.getDir());
            console.log('success');
        }
    });
})

router.get('/download/:id', userAuthenticated, (req, res) => {
    const gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection(Dir.getDir());
    var filename = req.params.id;

    gfs.exist({
        filename: filename
    }, (err, file) => {
        if (err || !file) {
            res.status(404).send('File Not Found');
            return
        }

        var readstream = gfs.createReadStream({
            filename: filename
        });
        readstream.pipe(res);
    });
});

module.exports = router;