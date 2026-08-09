import Joi from "joi"
import { generalFields } from "../../middlewares/validationMiddlewares/validation.middleware.js" 


export const  signUp_v = Joi.object().keys({
    userName: generalFields.userName.required(),
    email: generalFields.email.required(), 
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.valid(Joi.ref('password')).required(),
    phone: generalFields.phone.required(),
    DOB: generalFields.DOB.required(),
    'accept-language': generalFields["accept-language"],
}).required().options({allowUnknown:false})


export const  resendConfirmEmail_v = Joi.object().keys({
    email: generalFields.email.required(), 
    'accept-language': generalFields["accept-language"],
}).required()


export const  confirmEmail_v = Joi.object().keys({
    authorization: generalFields.token.required(),
    'accept-language':generalFields["accept-language"],
}).required().options({allowUnknown:false})


export const login_v = Joi.object().keys({
    email: generalFields.email,
    password: generalFields.password,
    'accept-language': generalFields["accept-language"]
}).required()



export const forgetPassOTP_v = Joi.object().keys({
    email:generalFields.email.required(),
    'accept-language': generalFields["accept-language"]
}).required()


export const resetPassword_v = Joi.object().keys({
    email:generalFields.email.required(),
    OTP: generalFields.OTP.required(),
    newPassword: generalFields.password.required(),
    confirmNewPassword: generalFields.confirmPassword.valid(Joi.ref('newPassword')).required(), 
    'accept-language': generalFields["accept-language"]
}).required()