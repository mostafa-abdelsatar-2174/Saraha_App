import jwt from "jsonwebtoken"
import userModel from "../../DB/models/User.model.js"


export const userRoles = {
    user:"User",
    admin:"Admin"
}

export const authentication = async (req, res, next) =>{
    try {
        const {authorization} = req.headers
        const [bearer, token] = authorization.split(" ") 
        if (!bearer || !token) {
            return res.status(400).json({message:"please enter valid token"})
        }
        
        let decode = undefined
        switch (bearer) {
            case 'admin':
                decode = jwt.verify(token, process.env.JWT_ADMIN_TOKEN_KEY)
                break;
            case 'bearer':
                decode = jwt.verify(token, process.env.JWT_TOKEN_KEY)
                break;
            default:
                break;
        } 
        if (!decode?._id) {
            return res.status(400).json({message:"in-valid token payload"})
        }

        const user = await userModel.findById(decode._id,{userName:1, email:1, phone:1, age:1, role:1})
        if (!user) {
            return res.status(404).json({message:"not registed"})
        }
        req.user = user
        return next()
    } catch (error) {
        switch (error.name) {
            case "TokenExpiredError":
            case "JsonWebTokenError":
                return res.status(400).json({message:"token error", error})
            default:
                return res.status(500).json({message:"server error", name:error.name, errorStack:error.stack})
        }
    }
}


export const authorization =  (accessRoles = []) =>{
return async (req, res, next) =>{
    try {
        if (!(accessRoles.includes(req.user.role))) {
            return res.status(403).json({message:"you don't have the access(un authorized account)"})
        }
        return next()
    } catch (error) {
        return res.status(500).json({message:"server error", name:error.name, errorStack:error.stack})
    }
}
}