import express from 'express'
import mongoose from 'mongoose'
import { json } from 'body-parser'
import { dataRouter } from './routes/data'

const app = express()
app.use(json())
app.use(dataRouter)

mongoose.connect('mongodb://192.168.249.129:27017/todo',
() => {
  console.log('connected to database')
})

app.listen(3000, () => {
  console.log('server is listening on port 3000')
})