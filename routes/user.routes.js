const router = require('express').Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const { authenticateUser } = require('../middlewares/auth.middleware');

router.post("/signup", async (req, res)=>{
    const { name, email, password } = req.body;
    try { 
        const salt = await bcrypt.genSalt(8)
        const hashedPass = await bcrypt.hash(password, salt)
        const newUser = await prisma.user.create({data:{name, email, password:hashedPass}})
        res.status(201).send({msg:"successfully signed up", newUser})
    } catch (error) {
        console.log(error.stack)
        res.status(500).json({msg:"something fialed"})
    }
})

router.post("/signin", async(req, res)=>{
    const {email, password} = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if (!existingUser){
            return res.status(400).json({
                status:"failed",
                msg:"user doesn't exisit"
            })
        }
        const isPasswordMatched = await bcrypt.compare(password, existingUser.password)
        if(!isPasswordMatched){
            return res.status(400).json({
                status:"failed",
                msg:"invalid email or password"
            })
        }
        const token = jwt.sign({id:existingUser.id}, process.env.TOKEN_SECRET, {expiresIn:'24h'})
        res.json({
            status:"success",
            token
        })
    } catch (error) {
        res.status(500).json({
            status:"error",
            msg:"error while logging in: "+error.message
        })
    }
})

router.get("/all", authenticateUser, async (req, res)=>{
    try {
        const users = await prisma.user.findMany()
        res.send(users)
    } catch (error) {
        
    }
})

module.exports = router