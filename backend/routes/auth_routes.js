import express from 'express'
import path from 'path'
const router=express.Router()
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/login",async (req,res)=>{
console.log(req.cookies.tokenlogin)
const tokenlogin = req.cookies.tokenlogin 
if (tokenlogin){
    res.send("<h2>the user is already login </h3>")
}
    res.sendFile(path.join(__dirname,'../public/login.html'))
})

router.get("/register",(req,res)=>{res.sendFile(path.join(__dirname,"../public.register.html"))})



router.post("/register",async (req,res)=>{
    console.log('user login info : ' , (req.body))
    const {username,email,password}=req.body 
    console.log(username,email,password)
    const user=await User.create({username:username,email:email,password:password})
    if (!user){
        res.status(400).send({message:'User not created'})
    }
    res.json({Newuser:user})
})

router.post("/login",async (req,res) => {
    const {email,password}=req.body 
    const user=await User.findOne({email:email})
    if (!user){
        res.json({msg : 'no user found'})
        return
    }
    const passwordindb = req.body.password 
    if (passwordindb===user.password){
        const token=jwt.sign({username:user.username,email:email},SECRET_KEY,{expiresIn:'6h'})
        res.cookie('tokenlogin',token)
        res.json({message:"user logged in " , token})
    }
    else{
        res.send("incorrect passwperd")
    }
})

export default router