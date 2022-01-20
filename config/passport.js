const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const Admin = mongoose.model('admins');

const keys = require('./keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

const opts2 = {};
opts2.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts2.secretOrKey = keys.secretOrKey2;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );

  passport.use("admin-rules",
  new JwtStrategy(opts2, (jwt_payload, done) => {
    Admin.findById(jwt_payload.id)
      .then(admin => {
        if (admin) {
          return done(null, admin);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
  })
);
};


