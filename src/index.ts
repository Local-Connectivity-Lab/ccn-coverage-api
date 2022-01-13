import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'
import { json, urlencoded, raw } from 'body-parser'
import { uploadRouter } from './routes/upload'
import { registerRouter } from './routes/register'
import { queryRouter } from './routes/query'
import { ldapRouter } from './routes/ldap-login'

// Change this line to match your mongodb server
// TODO: Work with ENV
const mongodbURI = 'mongodb://localhost:27017/api-data'
// const mongodbURI = 'mongodb://localhost:27017/api-data'
// const mongodbURI = 'mongodb://192.168.249.129:27017/api-data'
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

app.use(json({ limit: '2mb' }));
app.use(urlencoded({ extended: true }));
app.use(raw({type: 'application/octet-stream', limit : '2mb'}))
app.use(registerRouter)
app.use(uploadRouter)
app.use(queryRouter)
app.use(ldapRouter)
app.use(passport.initialize());


mongoose.connect(mongodbURI,
() => {
  console.log('connected to database')
})

app.listen(listeningPort, () => {
  console.log('server is listening on port ' + listeningPort)
})
