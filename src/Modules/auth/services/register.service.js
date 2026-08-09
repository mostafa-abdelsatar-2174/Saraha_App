import userModel from "../../../DB/models/User.model.js"
import { confirmEmailEvent } from "../../../utils/events/emails/confirmEmail.event.js"
import { asyncHandler } from "../../../utils/error/error.js"
import { generateEncryption } from "../../../utils/security/cryptHandler.js"
import { generateHash } from "../../../utils/security/hashHandler.js"
import { successResponse } from "../../../utils/response/success.response.js"
import { verifyToken } from "../../../utils/security/token.js"


export const signUp = asyncHandler(async(req, res, next) =>{
    const {userName, email, password, confirmPassword, phone, DOB} = req.body
    if (await userModel.findOne({email},{userName:1, _id:0})) {
        return next(new Error("email not valid", {cause:400}))
    }  
    const age =  Math.floor((new Date() - new Date(DOB)) / (31557600000))
    const cryptedPhone = generateEncryption({phone, encryptKey:process.env.ENCRYPT_PHONE_KEY})
    const hashedPass = generateHash({plainText:password, salt:parseInt(process.env.PASS_HASH_SALT)})
    await userModel.insertOne({userName, email, password:hashedPass, phone:cryptedPhone, age}) 
    confirmEmailEvent.emit("sendConfirmEmail",email)
    return successResponse({res, status:201, message:"Done, signUp successfuly"})
})

export const resendConfirmOTP = asyncHandler(
    async(req, res, next)=>{
        const {email} = req.body
        const user = await userModel.findOne({email},{userName:1, confirmEmail:1, _id:0})
        if (!user) {
            return next(new Error("email not valid", {cause:400}))
        } 
        if (user.confirmEmail) {
            return next(new Error("not unconfirmed email", {cause:400}))
        }  
        confirmEmailEvent.emit("sendConfirmEmail",email)
        return successResponse({res, message:"Done, confirm OTP resended"})
    }
)

export const confirmEmail = asyncHandler(async (req, res, next)=>{
    const {authorization} = req.headers
    const confirmDecode = verifyToken({token:authorization, secretKey:process.env.JWT_CONFIRM_EMAIL_TOKEN_KEY})
    if (!confirmDecode?.email) {
        return next(new Error("in-valid confirm token",{cause:401}))
    }
    const user = await userModel.findOne({email:confirmDecode.email, confirmEmail:false},{userName:1, email:1, confirmEmail:1, createdAt:1, _id:0})
    if (!user) {
        return next(new Error("that is not unconfirmed email"))
    } 
    if ((user.createdAt - new Date(confirmDecode.iat*1000) - 1000)>0) {
        return next(new Error("that's not token for this email"),{cause:403})
    }
    await userModel.updateOne({email:user.email}, {confirmEmail:true})
    return successResponse({res, message:"DONE, email confirmed"})
})
