const LocalStrategy = require('./strategy/local');
const HttpBearerStrategy = require('./strategy/bearer');
const AnonymousStrategy = require('passport-anonymous');
const LocalKakaoStrategy = require('./strategy/localKakao');
const LocalNaverStrategy = require('./strategy/localNaver');
const LocalFacebookStrategy = require("./strategy/localFacebook");

const Serializer = require('./serializer');
const passport = require('passport');

function setup(app) {
  app.use(passport.initialize());
  passport.use(new LocalStrategy());
  passport.use(new LocalKakaoStrategy());
  passport.use(new LocalNaverStrategy());
  passport.use(new LocalFacebookStrategy());
  passport.use(new HttpBearerStrategy());
  passport.use(new AnonymousStrategy());
  passport.serializeUser(Serializer.serializeUser);
  passport.deserializeUser(Serializer.deserializeUser);
}

module.exports = {
  setup
};
