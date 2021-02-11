const Task = require("../models/task")
const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router()

//creating a task
router.post("/tasks", auth, async (req, res) => {

    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id

        })
        await task.save()
        res.status(201).send(task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})
//getting all tasks
/*
tasks?completed=false/true
tasks?limit=number
/tasks?skip=number
/tasks?sortBy=completed:ascen  / desc

*/
router.get("/tasks",auth, async (req, res) => {
    try {
        //const task = await Task.find({})

        const match = {}
        const sort={}
       // console.log(req.query.completed==true)
        if(req.query.completed){
            
            match.completed = req.query.completed === "true"
            console.log(match)
        }
        if(req.query.sortBy){
            let sortQuery = req.query.sortBy.split(":")
            if(sortQuery[1]=="ascen")
                sort[sortQuery[0]] = -1
            else if(sortQuery[1]=="desc")
                sort[sortQuery[0]] = 1
        }
        console.log(sort)
        await req.user.populate({
            path:"tasks",
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})
//get a task
router.get("/tasks/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id//new ObjectID(req.params.id)
        //const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task)
            return res.status(404).send()

        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }

})
//update a task
router.patch("/tasks/:id",auth, async (req, res) => {
    const allowedUpdates = ["completed", "description"]
    const updates = Object.keys(req.body)

    const isValidUpdate = updates.every((element) => {
        return allowedUpdates.includes(element)
    })

    if (!isValidUpdate)
        return res.status(400).send({ "error": "Invalid Request" })
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send({ error: "not found" })
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }



})
//delete a task
router.delete("/tasks/:id",auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task)
            return res.status(404).send({ error: "not found" })
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})

module.exports = router