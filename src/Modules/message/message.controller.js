import { Router } from "express";
import * as messageSerivces from "./services/message.services.js";
import { validation } from "../../middlewares/validationMiddlewares/validation.middleware.js";
import * as validators from "./message.validation.js";
import {
  authentication,
  authorization,
} from "../../middlewares/authMiddlewares/auth.middleware.js";
import { messageRoles } from "./message.endpoint.js";
const router = Router();

router.post(
  "/send",
  validation(validators.sendMessage_v),
  messageSerivces.sendMessage,
);

router.get(
  "/all-messages",
  validation(validators.getAllMessages_v),
  authentication,
  authorization(messageRoles.getAllMessages),
  messageSerivces.getAllMessages,
);

router.delete(
  "/delete/:messageId",
  validation(validators.deleteMessage_v),
  authentication,
  messageSerivces.deleteMessage,
);

export default router;
