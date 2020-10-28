const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function (passport){
  //local Strategy
  passport.use(new LocalStrategy(function (username, password, done) {
    //match Username
    let query = {username:username};
    User.findOne(query, function (err, user) {
      if(err) throw err;
      if (!user){
        return done(null, false, {message: 'No User Found, Make sure to Register'});
        }

      //if user exists, you match password with bcrypt
      bcrypt.compare(password, user.password, function (err, isMatch){
        if (err) throw err;
        if(isMatch){
          return done(null, user);
        }else{
        return done(null, false, {message: 'Invalid Password'});
        }
      });
    })
  }));

  //passport sessions
  passport.serializeUser(function(user, done) {
          done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
          User.findById(id, function(err, user) {
            done(err, user);
          });
        });
}
