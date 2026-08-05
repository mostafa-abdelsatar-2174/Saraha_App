import { Router } from "express";
import * as userServices from "./services/user.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/authMiddlewares/auth.middleware.js";
import { validation } from "../../middlewares/validationMiddlewares/validation.middleware.js";
import * as validators from "./user.validation.js";
import { userAccessRoles } from "./user.endPoint.js";
const router = Router();

router.get(
  "/get-profile",
  validation(validators.getProfile_v),
  authentication,
  userServices.getProfile,
);

router.patch(
  "/update-profile",
  validation(validators.updateProfile_v),
  authentication,
  userServices.updateProfile,
);

router.patch(
  "/change-email",
  validation(validators.changeEmail_v),
  authentication,
  userServices.changeEmail,
);

router.patch(
  "/update-email",
  validation(validators.updateEmail_v),
  authentication,
  userServices.confirmNewEmail,
);

router.delete(
  "/delete-user/:userId",
  validation(validators.deleteUser_v),
  authentication,
  authorization(userAccessRoles.deleteUser),
  userServices.deteleUser,
);

export default router;
