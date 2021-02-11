const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    }

},{
    timestamps:true
})


const Task = mongoose.model('Task',taskSchema)

module.exports = Task

/*const t = new Task({
    description:"Clean tasks",
    
})

t.save().then((data)=>{
    console.log(data)
}).catch((e)=>{
    console.log(e)
})*/
