const express=require('express');
const router = require('./routes/route');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const app=express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded(({ extended: true })))

mongoose.connect("mongodb+srv://amarjeet:pNEQmxssu7hxVRvs@cluster0.qq47f.mongodb.net/project1" ,
 { useNewurlParser:true
 })
 .then (() => console.log("MongoDb is connected"))
 .catch(err => console.log(err))


app.use('/',router)




app.listen(process.env.PORT||3000,function(){
    console.log("port is running at:"+(process.env.PORT||3000))
});