import express from 'express'
import connect from './db/connection.js'
const app=express()

const PORT=3000
connect()
app.get('/',(req,res)=>{
    res.send('This is the main page')
})
app.listen(3000,()=>{
    console.log(`Listening at http://localhost:3000`)
})