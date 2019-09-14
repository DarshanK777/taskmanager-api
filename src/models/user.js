const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const task = require('./task')
const jwt = require('jsonwebtoken')

// create a custom schema for middleware implementation
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true,
        trim: true
    },
    email:{
        type : String,
        unique : true,
        lowercase : true ,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if (value < 0){
                throw new Error('Age should be positive')
            }
            
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        
    },
    tokens:[{
       token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps : true
})

//virtual entity
userSchema.virtual('tasks',{
    ref: 'Task',
    localField : '_id', // local field used as foreign key
    foreignField : 'owner' // foriegn key in refered table
})



// middleware for password hashing
userSchema.pre('save',async function(next){
    const user = this
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//creating custom methods
userSchema.statics.findByCredentials = async (email, password)=>{
    // statics are called on Model
    const user = await User.findOne({ email })

    if(!user){
        throw Error ('Unable to find user')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
       throw new Error('incorrect credentials')
    }

    return user
}

userSchema.methods.generateAuthToken = async function(){
    // method are called on model instance
    const user = this
    const token =  jwt.sign({ _id: user._id.toString() }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// to remove sensitive data when sent as json
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//deleting task with user
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({ owner : user._id})
    next()
})


const User = mongoose.model('User', userSchema)

// const me = new User({
//     name: 'Darshan',
//     age: 20 
//     })

// me.save().then((data)=>{
//     console.log(data)
// }).catch((error)=>{
//     console.log('Error', error)
// })

module.exports = User