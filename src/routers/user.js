const express = require("express")
const User = require("../models/user")
const auth = require("../middleware/auth")
const multer = require("multer")
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require("../emails/account")

const router = express.Router()

//Signup
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {

        const data = await user.save()
        const token = await user.getAuthToken()
        sendWelcomeEmail(data.name,data.email)
        res.status(201).send({ data, token })
    }
    catch (error) {
        res.status(400).send(error)
    }

})
//getting profile
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user)
})

//updating your profile
router.patch("/users/me", auth, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update) => {
        return allowedUpdates.includes(update);
    })
    if (!isValid) {
        return res.status(400).send()
    }
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
});

//deleting your profile
router.delete("/users/me", auth, async (req, res) => {
    try {
        //const user = await User.findByIdAndDelete(req.user._id)
        //if (!user) return res.status(404).send({ "error": "not found" })
        await req.user.remove()
        sendCancellationEmail(req.user.name,req.user.email)
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }

})

//Login 

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.getAuthToken()
        res.send({ user, token })
    } catch (e) {
        console.log("catch" + e)
        res.status(400).send("Invalid Login")
    }

})

//logout
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }

})

//logoutall
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Avatar upload
const upload = multer({
    //dest:"avatar",
    limits:{
        fileSize:2000000
    },
    fileFilter(req,file,cb){
        //console.log(file.originalname.match(/\.(png|jpg|jpeg|PNG)/))
        if(!file.originalname.match(/\.(png|jpg|jpeg|PNG)$/)){
            cb(new Error("Only Image files accepted"))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth, upload.single("avatar"),async(req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})

})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    try{
        req.user.avatar=undefined
        await req.user.save()
        res.send(req.user)

    }catch(e){
        res.status(500).send()
    }
})

router.get("/users/:id/avatar",async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)
            throw new Error()

        res.set("Content-type","image/png")
        res.send(user.avatar)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router

//getting users
/*router.get("/users", async (req, res) => {
    try {
        const users = await User.find({})
        if (users.length == 0)
            return res.status(404).send()
        res.send(users)
    } catch (error) {
        res.status(500).send()
    }
})*/

//gettig a user
/*router.get("/users/:id", async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)

    } catch (e) {
        res.status(500).send()
    }
})*/