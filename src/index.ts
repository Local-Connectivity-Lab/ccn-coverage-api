import CONFIG from './config';
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieSession from 'cookie-session';
import { json, urlencoded, raw } from 'body-parser';
import { uploadRouter } from './routes/upload';
import { reportRouter } from './routes/report';
import { registerRouter } from './routes/register';
import { queryRouter } from './routes/query';
import { ldapRouter } from './routes/ldap-login';
import { newUserRouter } from './routes/new-user';
import { usersRouter } from './routes/users';
import { editSitesRouter } from './routes/edit-sites';

const app = express();

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

// passport requires a session, this is maintained on the server to prevent additional authentications.
var sessionMiddleWare = cookieSession({
  name: 'session',
  keys: ['LetThisBeARandomTokenLike1#ha0npab92na01nfa0835iyvas'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

app.use(json({ limit: '2mb' }));
app.use(urlencoded({ extended: true }));
app.use(raw({ type: 'application/octet-stream', limit: '2mb' }));

// The order of the following middleware is very important for passport!!
app.use(sessionMiddleWare);
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

const db_url = process.env['MONGODB_URI']
  ? process.env['MONGODB_URI']
  : CONFIG['mongodbURI'];
console.log('connecting to: ', db_url);
mongoose.connect(db_url, (...cxnResult) => {
  console.log('Mongo connection result:', cxnResult);
});

const listeningPort = process.env['COVERAGE_API_PORT']
  ? process.env['COVERAGE_API_PORT']
  : CONFIG['port'];

const server = app.listen(listeningPort, () => {
  console.log('server is listening on port ' + listeningPort);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: stopping API server');
  shutdown();
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', () => {
  console.log('Got SIGINT. Graceful shutdown');
  shutdown();
});

// shut down server
function shutdown() {
  server.close(function onServerClosed(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
}
