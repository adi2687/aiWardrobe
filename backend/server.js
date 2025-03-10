import express from 'express'

const app=express()

const PORT=3000
app.get('/',(req,res)=>{
    res.send('This is the main page')
})
app.listen(3000,()=>{
    console.log(`Listening at http://localhost:3000`)
})