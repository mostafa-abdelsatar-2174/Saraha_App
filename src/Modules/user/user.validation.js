import Joi from "joi";
import { generalFields } from "../../middlewares/validationMiddlewares/validation.middleware.js";


export const getProfile_v = Joi.object().keys({
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()

export const shareProfile_v = Joi.object().keys({
    userId: generalFields.Id.required(),
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


export const changePassword_v = Joi.object().keys({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.invalid(Joi.ref('oldPassword')).required().messages({
        'any.invalid':"new Password can't be same oldPassword"
    }),
    confirmNewPassword: generalFields.confirmPassword.valid(Joi.ref('newPassword')).required(),
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()

export const freezeUser_v = Joi.object().keys({
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()

export const unFreezeUserOTP_v = Joi.object().keys({
    email: generalFields.email.required(),
    'accept-language': generalFields["accept-language"]
}).required()


export const confirmUnFreeze_v = Joi.object().keys({
    email: generalFields.email.required(),
    OTP: generalFields.OTP.required(),
    'accept-language': generalFields["accept-language"]
}).required()


export const deleteUser_v = Joi.object().keys({
    userId: generalFields.Id.required(),
    userEmail: generalFields.email.required(),
    authorization: generalFields.token.required(),
    'accept-language': generalFields["accept-language"]
}).required()


