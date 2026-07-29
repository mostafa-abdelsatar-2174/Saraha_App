import { Router } from "express";
import * as authServices from "./services/register.service.js"
const router = Router()

router.post("/signup", authServices.signUp)
router.post("/confirm-email", authServices.confirmEmail)
router.post("/login", authServices.login)

export default router