import Joi from "joi";
import { generalFields } from "../../middlewares/validationMiddlewares/validation.middleware.js";


export const getProfile_v = Joi.object().keys({
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()


export const updateProfile_v = Joi.object().keys({
    userName: generalFields.userName,
    phone: generalFields.phone,
    DOB: generalFields.DOB,
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()

export const changeEmail_v = Joi.object().keys({
    authorization: generalFields.token.required(),
    tempEmail: generalFields.email.required(),
    password: generalFields.password.required(),
    'accept-language': generalFields["accept-language"]
}).required()


export const updateEmail_v = Joi.object().keys({
    authorization: generalFields.token.required(),
    OTP: generalFields.OTP.required(),
    'accept-language': generalFields["accept-language"]
}).required()

export const deleteUser_v = Joi.object().keys({
    userId: generalFields.Id.required(),
    userEmail: generalFields.email.required(),
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()