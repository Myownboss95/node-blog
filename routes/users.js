const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//to bring in models
let User = require('../models/user');

//route to registeration form

router.get('/register', function (req, res){

      res.render('register', {
        //just testing for fun
        title: 'Registeration Page',
        query: req.query.lad
      });
});
module.exports = router;

//do registeration

router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const sex = req.body.sex;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid, Please Provide a Valid Email').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password does not match').equals(req.body.password);
  req.checkBody('sex', 'Gender is required').notEmpty();

  let errors = req.validationErrors();
  if (errors){
    res.render('register', {
        //to reload all fields instead of the user filling afresh
      errors:errors,
      name:name,
      email:email,
      username:username,
      password:password,
      sex:sex
    });
  } else {
    let newUser = new User ({
      name:name,
      email:email,
      username:username,
      password:password,
      sex:sex
    });
    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if (err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if (err) {
            console.log(err);
            return;
          } else{
            req.flash('success', 'You have been registered, you can now log in');
            res.redirect('/users/login');

          }
        });
      });
    });
  }
});
//route to the log in form
router.get('/login', function (req, res) {
  res.render('login');
});

//the log in process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
     failureRedirect: '/users/login',
     failureFlash: true
   })(req, res, next);
});

//log Out
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You signed out successfully');
  res.redirect('/users/login');
});
module.exports=router;
