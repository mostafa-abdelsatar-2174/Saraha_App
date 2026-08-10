import { userRoles } from "../../middlewares/authMiddlewares/auth.middleware.js";


export const messageRoles = {
    getAllMessages:[userRoles.superAdmin, userRoles.admin]
}