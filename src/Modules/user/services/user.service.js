import OTPModel from "../../../DB/models/OTP.model.js";
import userModel from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/error/error.js";
import { changeEmailOTPEvent } from "../../../utils/events/emails/changeEmailOTP.event.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateDecryption, generateEncryption } from "../../../utils/security/cryptHandler.js";
import { compareHash, generateHash } from "../../../utils/security/hashHandler.js";
import { generateOTP } from "../../../utils/security/OTPHandler.js";
import { OTPTypes } from "../user.endPoint.js";

export const getProfile = asyncHandler(
    async (req, res, next)=>{
        if (!req.user.confirmEmail) {
            return next(new Error("confirm your email first"))
        }
        return successResponse({res, message:"DONE", data:{You:req.user}})      
    }
)


export const updateProfile = asyncHandler(
    async (req, res, next)=>{
        req.body.DOB? req.body.age = Math.floor((new Date() - new Date(req.body.DOB)) / (31557600000))
            : req.body.age = req.user.age
        req.body.phone? req.body.phone = generateEncryption({plainText:req.body.phone, encryptKey:process.env.ENCRYPT_PHONE_KEY})
            : req.body.phone = req.user.phone
        const user = await userModel.findByIdAndUpdate(req.user._id, req.body, {returnDocument:"after", runValidators:true, projection:{userName:1, email:1, role:1, phone:1, age:1, _id:0}})
        return successResponse({res, message:"DONE, user updated", data:{You:user}})      
    }
)

export const changeEmail = asyncHandler(
    async (req, res, next)=>{
        const {tempEmail, password} = req.body
        if (tempEmail == req.user.email) {
            return next(new Error("new email cannot be the same as the current email"))
        }
        const user = await userModel.findById(req.user._id)
        if (!compareHash({plainText:password, hashedText:user.password})) {
            return next(new Error('wrong password'))
        }
        if (await userModel.findOne({email:tempEmail},{userName:1, _id:0})) {
            return next(new Error("in-valid new email"))
        }
        const newOTP = generateOTP()
        const hashedOTP = generateHash({plainText:newOTP})
        const OTPDoc = await OTPModel.findOneAndUpdate({
            userId:user._id,
            type:OTPTypes.changeEmail
        },{
            $set:{
                OTP:hashedOTP,
                data:{tempEmail},
                expiresAt:new Date(Date.now() + 60*1000),
                attempts:0
            }
        },{
            upsert:true
        })
        changeEmailOTPEvent.emit("sendOTP", tempEmail, newOTP)
        return successResponse({res, status:201, message:"change email OTP sended Done"})
    }
)


export const confirmNewEmail = asyncHandler(
    async (req, res, next)=>{
        const {OTP} = req.body
        const user = req.user
        const rightOTP = await OTPModel.findOne({userId:user._id, type:OTPTypes.changeEmail})
        if (!rightOTP) {
            return next(new Error("Your OTP had expired resend new one",{cause:403}))
        }
        if (rightOTP.attempts>=5) {
            await OTPModel.deleteOne({userId: user._id, type: OTPTypes.changeEmail})
            return next(new Error("this OTP is blocked"))
        }
        if (!compareHash({plainText:OTP, hashedText:rightOTP.OTP})) {
            await OTPModel.updateOne({userId:user._id, type:OTPTypes.changeEmail},{attempts: ++rightOTP.attempts})
            return next(new Error("in-valid OTP"))
        }
        if (await userModel.findOne({email:rightOTP.data.tempEmail},{userName:1, _id:0})) {
            return next(new Error("your new email become in-valid",{cause:403}))
        }
        const You = await userModel.findOneAndUpdate({_id:user._id},{$set:{email: rightOTP.data.tempEmail, sensitiveUpdateTime:Date.now()}},{runValidators:true, returnDocument:'after', projection:{userName:1, email:1, role:1, phone:1, age:1, _id:0}})
        await OTPModel.deleteOne({userId:user._id, type:OTPTypes.changeEmail})
        return successResponse({res, status:201, message:"DONE, email changed successfuly", data:{You}})
    }
)


export const deteleUser = asyncHandler(
    async (req, res, next)=>{
        const {userId} = req.params
        const user = await userModel.findById(userId, {email:1, _id:0}) 
        if(!user){
            return next(new Error("not exist any user with this id"))
        }
        if (user.email != req.body.userEmail) {
            return next(new Error("enter right deleted user email"))
        }
        await userModel.findByIdAndDelete(userId)
        return successResponse({res, status:201, message:"Done, user Deleted", data:user._doc})
    }
)