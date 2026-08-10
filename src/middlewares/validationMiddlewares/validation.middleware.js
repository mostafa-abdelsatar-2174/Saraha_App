import Joi from "joi"
import { Types } from "mongoose"


export const validObjectId = (value, helper) =>{
    return Types.ObjectId.isValid(value)
        ? true
        : helper.message("in-valid ObjectId")
}

export const generalFields = {
    userName: Joi.string().pattern(/^[A-Z][A-Za-z0-9]*$/).trim(true).min(2).max(20)
        .messages({'string.pattern.base':"in-valid user name formate"}),
    email: Joi.string().trim(true).email({minDomainSegments:2,maxDomainSegments:3,tlds:{allow:['com']}})
        .messages({"string.email": "Invalid email address", "any.required": "Email is required"}), 
    password: Joi.string().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,24}$/)
        .messages({
            "string.pattern.base":
            "Password must contain at least one uppercase letter, one lowercase letter, and one number."}),
    confirmPassword: Joi.string().messages({'any.only':"confirm pass not match password"}),
    phone: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    DOB: Joi.date().less('1-1-2010'),
    Id: Joi.string().custom(validObjectId).messages({"any.required":"Id is required"}),
    'accept-language': Joi.string().valid("en", "ar").required(),
    token: Joi.string(),
    OTP:Joi.string().pattern(/^[0-9]{6}$/),
    message: Joi.string().min(5).max(5000).trim(true)
}


export const validation = (schema)=>{
    return (req, res, next)=>{
        const validData = {...req.body, ...req.params, ...req.query}
        if (req.headers['accept-language']) {
            validData['accept-language'] = req.headers['accept-language']
        }
        if (req.headers.authorization) {
            validData.authorization = req.headers.authorization
        }
        const validationResult = schema.validate(validData,{abortEarly:false})
        if (validationResult.error) {
            return res.status(400).json({message:'invalid data', validError:validationResult.error.details})
            // return next(new Error(error))
        }
        return next()
    }
}