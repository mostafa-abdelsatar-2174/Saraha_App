import { Router } from "express";
import * as userServices from "./services/user.service.js"
import { authentication, authorization } from "../../middlewares/authMiddlewares/auth.middleware.js";
const router = Router()

router.get("/get-profile", authentication, userServices.getProfile)


export default router