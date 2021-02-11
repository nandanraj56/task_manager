const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true,useFindAndModify:false})
    .then((data)=>{
        console.log('Succesfully Connected')
    }).catch((e)=>{
        console.log(e)
    })

