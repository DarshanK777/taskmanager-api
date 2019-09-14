const express = require('express')
const User = require('../models/user')
const auth =  require("../middleware/auth")
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')

// create users
router.post('/users',async (req, res)=>{
    const user = new User(req.body)
    try{
        
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send(user)
    }catch(e){
        res.status(400).send(e)
    }
    
})

// read users
router.get('/users/me', auth ,async (req, res)=>{
    res.send(req.user)
})

// read user by id
// router.get('/users/:id', async (req, res)=>{
//     const _id = req.params.id
//     try{
//         const user = await User.findById(_id)
//         if(!user){
//             return res.status(404).send("User not found")
//         }
//         res.send(user)
//     } catch(e){
//         res.status(500).send("Internal server error")
//     }
// })

//update user
router.patch('/users/me', auth, async (req, res)=>{
    // this checks for the fields which can be updated
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update]

        })
        await req.user.save()
        res.send(user)
    }catch(e){
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        await req.user.remove() //does same as above
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

//login route
router.post('/users/login', async (req, res)=>{
     try{
        const user = await User.findByCredentials(req.body.email, req.body.password) // dev defined model function
        const token = await user.generateAuthToken() // dev defined model instance function
        console.log(user)
        res.status(200).send({ user, token })
     }catch(e){
        res.status(400).send()
     }
})

// logout route for a current token
router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// logout route for all token 
router.post('/users/logoutAll', auth, async (req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
}}
)

// upload images using multer
const upload = multer({
    dest: 'avatars',
    limit :{
        fileSize : 100000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error("Please upload an image"))
        }

        cb(undefined, true)
    }
})

// route for avataar upload and error message handling
router.post('/user/me/avatar', auth, upload.single('avatar'),async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({ 
        width: 250,
        height: 250
    }).png().toBuffer()

    // above sharp npm module is used
    // resize does what it says
    //.png() >> converts img to png format
    //.toBuffer() .. makes it accessible to in buffer format

    req.user.avatar = buffer // assigning to users avatar 
    await req.user.save()   // saving users avatar
    res.send()
},(error, req, res, next)=>{  // all 4 parameters are needed to tell express this function is used for error message handling
    res.status(400).send({error: error.message})
})

//delete avatar image
router.delete('/user/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// get user avatar by id
router.get('/users/:id/avatar', auth, async (req, res)=>{
    try{
        const user = await User.findById(req.params.id) // get the user

        if(!user || !user.avatar){ // if user not present or doesn't have a avatar
            throw new Error()
        }

        res.set('Content-Type','image/png') // setting response header to tell image is beign sent
        res.send(user.avatar)
    }catch(e){

    }
})

module.exports = router