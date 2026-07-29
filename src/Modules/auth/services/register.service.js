import userModel from "../../../DB/models/User.model.js"
import CryptoJS from "crypto-js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { userRoles } from "../../../middlewares/authMiddlewares/auth.middleware.js"
import { confirmEmailEvent } from "../../../events/emails/confirmEmail.event.js"
// import { HTMLFormat, sendEmail } from "../../../utils/email/sendEmail.js"

export const signUp = async(req, res, next) =>{
    try {
        const {userName, email, password, phone, DOB} = req.body
        if (!userName || !email || !password || !phone || !DOB) {
            return res.status(400).json({message:"enter all required feilds"})
        }
        const checkUser = await userModel.findOne({email},{userName:1, _id:0})
        if (checkUser) {
            return res.status(400).json({message:"email not valid"})
        }  
        let age = new Date() - new Date(DOB)
        age = Math.floor(age / (31557600000))
        const cryptedPhone = CryptoJS.AES.encrypt(phone, process.env.ENCRYPT_PHONE_KEY)
        const hashedPass = bcrypt.hashSync(password, parseInt(process.env.PASS_HASH_SALT))
        await userModel.insertOne({userName, email, password:hashedPass, phone:cryptedPhone, age}) 
        confirmEmailEvent.emit("sendConfirmEmail",email)
        return res.status(201).json({message:"DONE, user registed"})
    } catch (error) {
        return res.status(500).json({message:"server error", name:error.name, errorStack:error.stack})
    }
}


export const login = async(req, res, next) =>{
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.status(400).json({message:"enter all required feilds"})
        }
        const checkUser = await userModel.findOne({email})
        if (!checkUser) {
            return res.status(400).json({message:"email not valid"})
        }  
        if (!checkUser.confirmEmail) {
            return res.status(400).json({message:"confirm your email first"})
        }  
        const validPass = bcrypt.compareSync(password, checkUser.password)
        if (!validPass) {
            return res.status(400).json({message:"email or password not right"})
        }
        
        const token = jwt.sign({_id:checkUser._id, isLogged:true},
            checkUser.role==userRoles.admin? process.env.JWT_ADMIN_TOKEN_KEY : process.env.JWT_TOKEN_KEY,
            {expiresIn:"12h"}) 
        return res.status(201).json({message:"DONE, user loggedIn", token})
    } catch (error) {
        return res.status(500).json({message:"server error", name:error.name, errorStack:error.stack})
    }
}

export const confirmEmail = async (req, res, next)=>{
    try {
        const {authorization} = req.headers
        if (!authorization) {
            return res.status(400).json({message:"enter confirm token"})
        }
        const confirmDecode = jwt.verify(authorization, process.env.JWT_CONFIRM_EMAIL_TOKEN_KEY)
        // console.log("🚀 ~ confirmEmail ~ confirmDecode:", confirmDecode)
        if (!confirmDecode?.email) {
            return res.status(401).json({message:"in-valid confirm token"})
        }
        const user = await userModel.findOne({email:confirmDecode.email},{userName:1, email:1, confirmEmail:1, createdAt:1, _id:0})
        const rightToken = user.createdAt - new Date(confirmDecode.iat*1000) - 1000
        if (!user) {
            return res.status(404).json({message:"not registered email"})
        }
        if (user.confirmEmail) {
            return res.status(400).json({message:"email already confirmed"})
        }
        // console.log({user:user.createdAt, decode:new Date(confirmDecode.iat*1000)});
        // console.log("🚀 ~ confirmEmail ~ rightToken:", rightToken)
        if (rightToken>0) {
            return res.status(403).json({message:"that is old token"})
        }
        const theUser = await userModel.updateOne({email:user.email}, {confirmEmail:true})
        return res.status(201).json({message:"DONE, email confirmed", theUser})
    } catch (error) {
        return res.status(500).json({message:"server error", name:error.name, errorStack:error.stack})
    }
}
