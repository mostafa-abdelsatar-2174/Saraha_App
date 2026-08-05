import mongoose from "mongoose";
import { OTPTypes } from "../../Modules/user/user.endPoint.js";
const OTPSchema = mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true,
    },
    type:{
        type:String,
        enum:Object.values(OTPTypes),
        required:true
    },
    OTP:{
        type:String,
        required:true
    },
    data:{
        type: mongoose.Schema.Types.Mixed,
        default:{}
    },
    attempts:{
        type:Number,
        default:0
    },
    expiresAt:{
        type:Date,
        required:true,
        expires:0
    }
},{
    timestamps:true
})

OTPSchema.index({
    userId:1,
    type:1
},{unique:true})


const OTPModel = mongoose.models.OTP || mongoose.model('OTP', OTPSchema)
export default OTPModel