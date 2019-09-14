const express = require('express')
require('./db/mongoose')
const app = express()
const port = process.env.PORT
const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log('Server up at : '+ port)
})