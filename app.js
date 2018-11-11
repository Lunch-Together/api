const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const errorHandler = require('api-error-handler');

// Passport
const passportHelper = require('./helpers/passport');
const passport = require('passport');

const app = express();

// Setup Passport
passportHelper.setup(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport
app.use(passport.authenticate(['bearer', 'anonymous']));
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/login', require('./routes/login'));
app.use('/shops', require('./routes/shops'));
app.use('/tables', require('./routes/tables'));
app.use('/groups', require('./routes/groups'));
app.use('/me', require('./routes/me'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorHandler());

module.exports = app;
