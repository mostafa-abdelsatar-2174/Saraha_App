import { Router } from "express";
import * as registerServices from "./services/register.service.js"
import * as loginServices from "./services/login.service.js"
const router = Router()

router.post("/signup", registerServices.signUp)
router.post("/confirm-email", registerServices.confirmEmail)
router.post("/login", loginServices.login)

export default router