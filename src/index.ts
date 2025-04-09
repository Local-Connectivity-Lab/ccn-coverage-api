import CONFIG from './config';
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import { uploadRouter } from './routes/upload';
import { reportRouter } from './routes/report';
import { registerRouter } from './routes/register';
import { queryRouter } from './routes/query';
import { ldapRouter } from './routes/ldap-login';
import { newUserRouter } from './routes/new-user';
import { usersRouter } from './routes/users';
import { editSitesRouter } from './routes/edit-sites';
import logger from './logger';
import cors from 'cors';

// Change this line to match your mongodb server

const listeningPort = 3000;

const app = express();

// passport requires this
passport.serializeUser(function (user, done: (a: any, b: any) => void) {
  logger.debug('Serializing user:' + user.uid);
  done(null, user);
});
// passport requires this
passport.deserializeUser(function (user, done: (a: any, b: any) => void) {
  logger.debug('Deserializing user:' + user);
  done(null, user);
});

app.use(
  cors({
    origin: true, // Allows any origin during testing
    credentials: true, // Enables Access-Control-Allow-Credentials: true
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'application/octet-stream', limit: '2mb' }));

// passport requires a session, this is maintained on the server to prevent additional authentications.
var expressSessionMiddleWare = session({
  name: 'session',
  secret: 'LetThisBeARandomTokenLike1#ha0npab92na01nfa0835iyvas',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: CONFIG.secureCookie, // Set to true if using HTTPS or production
    sameSite: 'lax',
    httpOnly: true,
  },
});

// The order of the following middleware is very important for passport!!
app.use(expressSessionMiddleWare);
// passport requires these two
app.use(passport.initialize());
app.use(passport.session());

app.use(registerRouter);
app.use(uploadRouter);
app.use(reportRouter);
app.use(queryRouter);
app.use(ldapRouter);
app.use(newUserRouter);
app.use(usersRouter);
app.use(editSitesRouter);

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Server process terminated');
  process.exit(0);
});

mongoose
  .connect(CONFIG.mongodbURI, {
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    logger.info('Mongo connected');
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1); // Exit with failure
  });

app.listen(listeningPort, () => {
  logger.info(`server is listening on port ${listeningPort}`);
});
