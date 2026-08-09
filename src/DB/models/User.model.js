import mongoose from "mongoose";
import { userRoles } from "../../middlewares/authMiddlewares/auth.middleware.js";

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    password:{
        type:String,
        minLength:[8,"minmum length is 8 for password"],
        required:true
    },
    role:{
        type:String,
        enum:Object.values(userRoles),
        default:userRoles.user,
        trim:true
    },
    phone:{
        type:String,
        minLength:[11,"enter right phone number"],
        required:true,
        trim:true
    },
    age:{
        type:Number,
        required:true,
    },
    confirmEmail:{
        type:Boolean,
        default:false,
    },
    sensitiveUpdateTime:Date,
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const userModel = mongoose.models.User || mongoose.model("User", userSchema)
export default userModel