import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
import cors from 'cors';

import dbConfig from './config/database';
import loadModules from './modules/load.modules';
import passportConfig from './config/passport';

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
}

require('./helpers/custom.response');

var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');

const app = express();

//Config connect database
const environment = app.get('env');
const testing = environment === 'testing';
const databaseUri = dbConfig[environment].uri;
let options = {
  autoIndex: false
};

if (testing) {
  options.user = process.env.DB_USER;
  options.pass = process.env.DB_PASS;
  options.keepAlive = true;
  options.keepAliveInitialDelay = 300000;
}

mongoose.connect(databaseUri, options)
  .then(() => {console.log(`Database connected at ${databaseUri}`)})
  .catch(err => console.log(`Database connection error: ${err.message}`));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(corsOptions));

loadModules(app);

passportConfig();

//Initialise Passport before using the route middleware
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
