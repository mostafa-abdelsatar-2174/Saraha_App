import { Router } from "express";
import * as registerServices from "./services/register.service.js"
import * as loginServices from "./services/login.service.js"
import * as validators from "./auth.validation.js"
import { validation } from "../../middlewares/validationMiddlewares/validation.middleware.js";
const router = Router()

router.post("/signup", validation(validators.signUp_v), registerServices.signUp)
router.post("/resend-confirmOTP", validation(validators.resendConfirmEmail_v), registerServices.resendConfirmOTP)
router.post("/confirm-email", validation(validators.confirmEmail_v), registerServices.confirmEmail)
router.post("/login", validation(validators.login_v), loginServices.login)
router.get("/forget-pass-otp", validation(validators.forgetPassOTP_v), loginServices.forgetPasswordOTP)
router.patch("/reset-pass", validation(validators.resetPassword_v), loginServices.resetPassword)


export default router