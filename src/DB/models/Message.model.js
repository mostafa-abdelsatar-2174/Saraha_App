import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message:{
        type:String,
        required:true,
        trim:true,
        minlength:5,
        maxlength:5000
    },
    receiverId:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps: true
})

const messageModel = mongoose.models.Message || mongoose.model('Message', messageSchema)
export default messageModel