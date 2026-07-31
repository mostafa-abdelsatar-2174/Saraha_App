import userModel from "../../../DB/models/User.model.js"
import { userRoles } from "../../../middlewares/authMiddlewares/auth.middleware.js"
import { asyncHandler } from "../../../utils/error/error.js"
import { compareHash } from "../../../utils/security/hashHandler.js"
import { successResponse } from "../../../utils/response/success.response.js"
import { generateToken } from "../../../utils/security/token.js"

export const login = asyncHandler(async(req, res, next) =>{
    const {email, password} = req.body
    if (!email || !password ) {
        return next(new Error("enter email and right password"))
    }
    const checkUser = await userModel.findOne({email})
    if (!checkUser) {
        return next(new Error("email not valid"))
    }  
    if (!checkUser.confirmEmail) {
        return next(new Error("confirm your email first"))
    }  
    const validPass = compareHash({plainText:password, hashedText:checkUser.password})
    if (!validPass) {
        return next(new Error("email or password not right"))
    }
    
    // const token = jwt.sign({_id:checkUser._id, isLogged:true},
    //     checkUser.role==userRoles.admin? process.env.JWT_ADMIN_TOKEN_KEY : process.env.JWT_TOKEN_KEY,
    //     {expiresIn:"12h"}) 
    const token = generateToken({payload:{_id:checkUser._id, isLogged:true}, 
        secretKey:checkUser.role==userRoles.admin? process.env.JWT_ADMIN_TOKEN_KEY 
            : process.env.JWT_TOKEN_KEY,
        options:{expiresIn:"12h"}
    }) 
    return successResponse({res, message:"DONE, user loggedIn", data:{token}})
})