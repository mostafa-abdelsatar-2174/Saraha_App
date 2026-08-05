import { Router } from "express";
import * as registerServices from "./services/register.service.js"
import * as loginServices from "./services/login.service.js"
import * as validators from "./auth.validation.js"
import { validation } from "../../middlewares/validationMiddlewares/validation.middleware.js";
const router = Router()

router.post("/signup", validation(validators.signUp_v), registerServices.signUp)
router.post("/confirm-email", validation(validators.confirmEmail_v), registerServices.confirmEmail)
router.post("/login", validation(validators.login_v), loginServices.login)

export default router