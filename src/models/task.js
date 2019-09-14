const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description :{
        type: String,
        required :true,
        trim: true
    },
    completed : {
        type: Boolean,
        default: false
    },
    owner :  {
        type: mongoose.Schema.Types.ObjectId,// datatype for object_id
        required : true,
        ref : 'User'
    }
},{
    timestamps : true
})

const Task = mongoose.model('Task', taskSchema)

// const task = new Task({
//     description: 'Learn th mongoose',
//     completed: false
// })

// task.save().then(()=>{
//     console.log(task)
// }).catch((error)=>{
//     console.log(error)
// })

module.exports = Task