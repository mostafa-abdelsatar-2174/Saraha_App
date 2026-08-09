import { userRoles } from "../../middlewares/authMiddlewares/auth.middleware.js"

export const userAccessRoles = {
    //services >> roles is in array
    deleteUser: [userRoles.superAdmin]
}

export const OTPTypes = {
    changeEmail: 'change-email', 
    forgetPassword: 'forget-password',
    unFreeze: 'un-freeze'
}