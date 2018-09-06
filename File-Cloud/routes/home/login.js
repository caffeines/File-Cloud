// Express conection
var express = require('express');
var router = express.Router();

//Schema 
const User = require('../../models/User');
router.post('/', (req, res) => {
    let email = req.body.email;
    let pass = req.body.pass;
    User.findOne({ email: email }).then(users => {
        if (users != null && users.email == email && users.password == pass) {
            res.send(users);
        } else {
            res.send('Password or Email is incorrect');
        }
    });


});

module.exports = router;