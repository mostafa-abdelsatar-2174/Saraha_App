import Joi from "joi";
import { generalFields } from "../../middlewares/validationMiddlewares/validation.middleware.js";


export const sendMessage_v = Joi.object().keys({
    message: generalFields.message.required(),
    receiverId: generalFields.Id.required(),
    'accept-language': generalFields["accept-language"]
}).required()


export const getAllMessages_v = Joi.object().keys({
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()


export const deleteMessage_v = Joi.object().keys({
    messageId: generalFields.Id.required(),
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()