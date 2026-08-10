import messageModel from "../../../DB/models/Message.model.js";
import userModel from "../../../DB/models/User.model.js";
import { userRoles } from "../../../middlewares/authMiddlewares/auth.middleware.js";
import { asyncHandler } from "../../../utils/error/error.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const sendMessage = asyncHandler(
    async (req, res, next)=>{
        const {message, receiverId} = req.body
        if (!await userModel.findOne({_id:receiverId, isDeleted:false},{userName:1, _id:0})) {
            return next(new Error("in-valid user",{cause:404}))
        }
        const newMessage = await messageModel.create({message, receiverId})
        return successResponse({res, status:201, message:"Done, message sended", data:{newMessage}})
    }
)


export const getAllMessages = asyncHandler(
    async (req, res, next)=>{
        const messages = await messageModel.find().populate([{
            path:'receiverId',
            select:'userName email'
        }])
        if (messages.length == 0) {
            return next(new Error('not exist any message'))
        }
        return successResponse({res, data:{messages}})
    }
)


export const deleteMessage = asyncHandler(
    async (req, res, next)=>{
        const {messageId} = req.params
        const message = await messageModel.findById(messageId)
        if (!message) {
            return next(new Error("not exist any message with this id",{cause:404}))
        }
        if (req.user.role == userRoles.user && req.user._id != message.receiverId) {
            return next(new Error("You are not allowed to delete this message."))
        }
        await messageModel.deleteOne({_id:message._id})
        return successResponse({res, status:201, message:"Done, message deleted"})
    }
)