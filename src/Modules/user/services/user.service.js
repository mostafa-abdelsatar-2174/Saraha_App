import { asyncHandler } from "../../../utils/error/error.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateDecryption } from "../../../utils/security/cryptHandler.js";

export const getProfile = asyncHandler(
    async (req, res, next)=>{
        if (!req.user.confirmEmail) {
            return next(new Error("confirm your email first"))
        }
        return successResponse({res, message:"DONE", data:{You:req.user}})      
    }
)