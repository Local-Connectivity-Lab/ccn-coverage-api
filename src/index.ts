import express from 'express'
import mongoose from 'mongoose'
import { json } from 'body-parser'
import { dataRouter } from './routes/data'

// Change this line to match your mongodb server
const mongodbURI = 'mongodb://localhost:27017/data'
const listeningPort = 3000

const app = express()
app.use(json())
app.use(dataRouter)


mongoose.connect(mongodbURI,
() => {
  console.log('connected to database')
})

app.listen(listeningPort, () => {
  console.log('server is listening on port ' + listeningPort)
})