// Express conection 
var express = require('express');
var router = express.Router();

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

//Schema 
const User = require('../../models/User');
const swal = require('sweetalert2');
router.post('/', (req, res) => {

    User.findOne({ email: req.body.email }).then(users => {
        if (users != null && users.email == req.body.email) {
            res.send(`This email already exist`);
        } else {
            const newUser = new User({
                email: req.body.email,
                name: req.body.name,
                password: req.body.pass,
                position: 123,
                dateOFRegistration: "08.082018"
            });
            newUser.save().then(saveUser => {
                res.redirect('/login');
            }).catch(err => {
                res.status(404).send('NOT SAVED');
                throw err;
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