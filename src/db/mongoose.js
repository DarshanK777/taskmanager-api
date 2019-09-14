const mongoose = require('mongoose')
const port = process.env.PORT


//this is new

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false  // removes deprecation warning
})



