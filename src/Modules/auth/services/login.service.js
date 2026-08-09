import userModel from "../../../DB/models/User.model.js";
import { userRoles } from "../../../middlewares/authMiddlewares/auth.middleware.js";
import { asyncHandler } from "../../../utils/error/error.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hashHandler.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateToken } from "../../../utils/security/token.js";
import { generateOTP } from "../../../utils/security/OTPHandler.js";
import OTPModel from "../../../DB/models/OTP.model.js";
import { OTPTypes } from "../../user/user.endPoint.js";
import { sendOTPEvent } from "../../../utils/events/emails/sendOTP.event.js";

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const checkUser = await userModel.findOne({ email });
  if (!checkUser) {
    return next(new Error("email not valid"));
  }
  if (checkUser.isDeleted) {
    return next(new Error("your account is freezed!!"));
  }
  if (!checkUser.confirmEmail) {
    return next(new Error("confirm your email first"));
  }
  const validPass = compareHash({
    plainText: password,
    hashedText: checkUser.password,
  });
  if (!validPass) {
    return next(new Error("email or password not right"));
  }
  const token = generateToken({
    payload: { _id: checkUser._id, isLogged: true },
    secretKey:
      checkUser.role == userRoles.admin ||
      checkUser.role == userRoles.superAdmin
        ? process.env.JWT_ADMIN_TOKEN_KEY
        : process.env.JWT_TOKEN_KEY,
    options: { expiresIn: "12h" },
  });
  return successResponse({
    res,
    message: "DONE, user loggedIn",
    data: { token },
  });
});

export const forgetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email }, { userName: 1 });
  if (!user) {
    return next(new Error("in-valid email"));
  }
  const OTP = generateOTP();
  const hashedOTP = generateHash({ plainText: OTP });
  await OTPModel.findOneAndUpdate(
    { userId: user._id, type: OTPTypes.forgetPassword },
    {
      $set: {
        OTP: hashedOTP,
        expiresAt: Date.now() + 60 * 1000,
      },
    },
    { upsert: true },
  );
  sendOTPEvent.emit(
    "sendOTP",
    email,
    OTP,
    "Your reset password OTP",
    "use this OTP to reset new password",
    "Your Forget Passwprd OTP",
  );
  return successResponse({
    res,
    status: 201,
    message: "Your OTP sended 'check your mail'",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, OTP, newPassword, confirmNewPassword } = req.body;
  const user = await userModel.findOne({ email }, { userName: 1 });
  if (!user) {
    return next(new Error("in-valid email"));
  }
  const verifyOTP = await OTPModel.findOne({
    userId: user._id,
    type: OTPTypes.forgetPassword,
  });
  if (!verifyOTP) {
    return next(
      new Error("Your OTP had expired resend new one", { cause: 403 }),
    );
  }
  if (verifyOTP.attempts >= 5) {
    await OTPModel.deleteOne({ _id: verifyOTP._id });
    return next(new Error("this OTP is blocked"));
  }
  if (!compareHash({ plainText: OTP, hashedText: verifyOTP.OTP })) {
    await OTPModel.updateOne(
      { _id: verifyOTP._id },
      { attempts: ++verifyOTP.attempts },
    );
    return next(new Error("in-valid OTP"));
  }
  const hashedPass = generateHash({ plainText: newPassword });
  await userModel.updateOne(
    { email },
    { $set: { password: hashedPass, sensitiveUpdateTime: Date.now() } },
    { runValidators: true },
  );
  await OTPModel.deleteOne({ _id: verifyOTP._id });
  return successResponse({
    res,
    status: 201,
    message: "Done, your password reseted",
  });
});
