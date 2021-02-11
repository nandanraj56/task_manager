const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require('./task')
//const { delete } = require('../routers/user')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(value.toLowerCase().indexOf("password")>-1){
                throw Error('Password should not be password')
            }
        },
        minLength:6,
        trim:true
        
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0)
                throw new Error('Age must be positive')
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})
//Virtual view
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//instance level method
userSchema.methods.toJSON = function(){
    const userObj = this.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}
userSchema.methods.getAuthToken= async function(){
    const user = this
    const token = await jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    //console.log(token)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
    
};
//model level method
userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error("Invalid login")
    }
    //console.log(user)
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Invalid login")
    }
    return user
}
//before saving rule, similar to before business rule
userSchema.pre("save",async function(next){
    const user = this
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})
userSchema.pre("remove",async function(next){
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})
const User = mongoose.model('Users',userSchema)




module.exports = User;
