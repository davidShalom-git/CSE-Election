require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const user = require('./router/User')



app.use(cors())
app.use(bodyParser.json())


mongoose.connect('mongodb://127.0.0.1:27017/vote').then((res)=>{
    console.log('db connected')
}).catch((err)=> {
    console.log(err)
})


app.use('/api/vote',user)




app.listen(1200,(req,res)=> {
    console.log('server is running on port 1200')
})




