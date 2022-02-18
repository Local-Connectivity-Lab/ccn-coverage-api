import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'
import cookieSession from 'cookie-session';
import { json, urlencoded, raw } from 'body-parser'
import { uploadRouter } from './routes/upload'
import { reportRouter } from './routes/report'
import { registerRouter } from './routes/register'
import { queryRouter } from './routes/query'
import { ldapRouter } from './routes/ldap-login'
import { newUserRouter } from './routes/new-user'
import { usersRouter } from './routes/users'
import { editSitesRouter } from './routes/edit-sites'

// Change this line to match your mongodb server
// TODO: Work with ENV
// const mongodbURI = 'mongodb://localhost:27017/api-data'
// const mongodbURI = 'mongodb://localhost:27017/api-data'
const mongodbURI = 'mongodb://192.168.249.129:27017/api-data'
const listeningPort = 3000

const app = express()
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
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

app.use(json({ limit: '2mb' }));
app.use(urlencoded({ extended: true }));
app.use(raw({type: 'application/octet-stream', limit : '2mb'}))
app.use(passport.initialize());


// The order of the following middleware is very important for passport!!
app.use(sessionMiddleWare);
// passport requires these two
app.use(passport.initialize());
app.use(passport.session());

app.use(registerRouter)
app.use(uploadRouter)
app.use(reportRouter)
app.use(queryRouter)
app.use(ldapRouter)
app.use(newUserRouter)
app.use(usersRouter)
app.use(editSitesRouter)


mongoose.connect(mongodbURI,
() => {
  console.log('connected to database')
})

app.listen(listeningPort, () => {
  console.log('server is listening on port ' + listeningPort)
})
