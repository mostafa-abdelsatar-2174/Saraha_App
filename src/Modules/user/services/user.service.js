import messageModel from "../../../DB/models/Message.model.js";
import OTPModel from "../../../DB/models/OTP.model.js";
import userModel from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/error/error.js";
import { sendOTPEvent } from "../../../utils/events/emails/sendOTP.event.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  generateDecryption,
  generateEncryption,
} from "../../../utils/security/cryptHandler.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hashHandler.js";
import { generateOTP } from "../../../utils/security/OTPHandler.js";
import { OTPTypes } from "../user.endPoint.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  if (!req.user.confirmEmail) {
    return next(new Error("confirm your email first"));
  }
  req.user.phone = generateDecryption({cipherText:req.user.phone })
  const yourMessages = await messageModel.find({receiverId: req.user._id})
  return successResponse({ res, message: "DONE", data: { You: req.user , yourMessages} });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({_id:req.params.userId, isDeleted:false}).select("userName email -_id")
  return user? successResponse({ res, message: "DONE", data: { user } }) : next(new Error("in-valid user ID",{cause:404})) 
});


export const updateProfile = asyncHandler(async (req, res, next) => {
  req.body.DOB
    ? (req.body.age = Math.floor(
        (new Date() - new Date(req.body.DOB)) / 31557600000,
      ))
    : (req.body.age = req.user.age);
  req.body.phone
    ? (req.body.phone = generateEncryption({
        plainText: req.body.phone,
        encryptKey: process.env.ENCRYPT_PHONE_KEY,
      }))
    : (req.body.phone = req.user.phone);
  const user = await userModel.findByIdAndUpdate(req.user._id, req.body, {
    returnDocument: "after",
    runValidators: true,
    projection: { userName: 1, email: 1, role: 1, phone: 1, age: 1, _id: 0 },
  });
  return successResponse({
    res,
    message: "DONE, user updated",
    data: { You: user },
  });
});

export const changeEmail = asyncHandler(async (req, res, next) => {
  const { tempEmail, password } = req.body;
  if (tempEmail == req.user.email) {
    return next(new Error("new email cannot be the same as the current email"));
  }
  const user = await userModel.findById(req.user._id);
  if (!compareHash({ plainText: password, hashedText: user.password })) {
    return next(new Error("wrong password"));
  }
  if (await userModel.findOne({ email: tempEmail }, { userName: 1, _id: 0 })) {
    return next(new Error("in-valid new email"));
  }
  const newOTP = generateOTP();
  const hashedOTP = generateHash({ plainText: newOTP });
  await OTPModel.findOneAndUpdate(
    {
      userId: user._id,
      type: OTPTypes.changeEmail,
    },
    {
      $set: {
        OTP: hashedOTP,
        data: { tempEmail },
        expiresAt: new Date(Date.now() + 60 * 1000),
        attempts: 0,
      },
    },
    {
      upsert: true,
    },
  );
  sendOTPEvent.emit(
    "sendOTP",
    tempEmail,
    newOTP,
    "change email OTP",
    "Use this OTP to confirm your new email address. Do not share this code with anyone.",
    "change your Email OTP",
  );
  return successResponse({
    res,
    status: 201,
    message: "change email OTP sended Done 'check your mail'",
  });
});

export const confirmNewEmail = asyncHandler(async (req, res, next) => {
  const { OTP } = req.body;
  const user = req.user;
  const rightOTP = await OTPModel.findOne({
    userId: user._id,
    type: OTPTypes.changeEmail,
  });
  if (!rightOTP) {
    return next(
      new Error("Your OTP had expired resend new one", { cause: 403 }),
    );
  }
  if (rightOTP.attempts >= 5) {
    await OTPModel.deleteOne({ userId: user._id, type: OTPTypes.changeEmail });
    return next(new Error("this OTP is blocked"));
  }
  if (!compareHash({ plainText: OTP, hashedText: rightOTP.OTP })) {
    await OTPModel.updateOne(
      { _id: rightOTP._id },
      { attempts: ++rightOTP.attempts },
    );
    return next(new Error("in-valid OTP"));
  }
  if (await userModel.findOne({ email: rightOTP.data.tempEmail },{ userName: 1, _id: 0 })) {
    return next(new Error("your new email become in-valid", { cause: 403 }));
  }
  const You = await userModel.findOneAndUpdate(
    { _id: user._id },
    {
      $set: { email: rightOTP.data.tempEmail, sensitiveUpdateTime: Date.now() },
    },
    {
      runValidators: true,
      returnDocument: "after",
      projection: { userName: 1, email: 1, role: 1, phone: 1, age: 1, _id: 0 },
    },
  );
  await OTPModel.deleteOne({ _id: rightOTP._id });
  return successResponse({
    res,
    status: 201,
    message: "DONE, email changed successfuly",
    data: { You },
  });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new Error("in-valid user ID"));
  }
  if (!compareHash({ plainText: oldPassword, hashedText: user.password })) {
    return next(new Error("old password is wrong"));
  }
  const hashedPass = generateHash({ plainText: newPassword });
  await userModel.updateOne(
    { _id: user._id },
    { $set: { password: hashedPass, sensitiveUpdateTime: Date.now() } },
    { runValidators: true },
  );
  return successResponse({
    res,
    status: 201,
    message: "password updated successfuly",
  });
});

export const freezeUser = asyncHandler(async (req, res, next) => {
  const You = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    { isDeleted: true, sensitiveUpdateTime: Date.now() },
    {
      returnDocument: "after",
      runValidators: true,
      projection: { userName: 1, isDeleted: 1, _id: 0 },
    },
  );
  if (!You) {
    return next(new Error("in-valid user ID"));
  }
  return successResponse({
    res,
    status: 201,
    message: "user freezed successfuly",
    date: { You },
  });
});

export const unFreezeUserOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne(
    { email },
    { userName: 1, email: 1, isDeleted: 1 },
  );
  if (!user) {
    return next(new Error("email not valid"));
  }
  if (!user.isDeleted) {
    return next(new Error("your account already active"));
  }
  const OTP = generateOTP();
  const hashedOTP = generateHash({ plainText: OTP });
  await OTPModel.updateOne(
    { userId: user._id, type: OTPTypes.unFreeze },
    {
      OTP: hashedOTP,
      expiresAt: new Date(Date.now() + 60 * 1000),
    },
    { upsert: true },
  );
  sendOTPEvent.emit(
    "sendOTP",
    email,
    OTP,
    "this OTP to unFreezed your account",
    "Use this OTP to un freeze you account. Do not share this code with anyone.",
    "unFreeze your account",
  );
  return successResponse({res, message:"Done, your OTP sended 'check your mail'"})
});

export const unFreezeconfirm = asyncHandler(async (req, res, next) => {
  const { email, OTP } = req.body;
  const user = await userModel.findOne(
    { email },
    { userName: 1, email: 1, isDeleted: 1 },
  );
  if (!user) {
    return next(new Error("email not valid"));
  }
  if (!user.isDeleted) {
    return next(new Error("your account already active"));
  }
  const verifyOTP = await OTPModel.findOne({userId: user._id, type:OTPTypes.unFreeze}) ;
  if (!verifyOTP) {
    return next(
      new Error("Your OTP had expired resend new one", { cause: 403 }),
    );
  }
  if (verifyOTP.attempts>=5) {
    await OTPModel.deleteOne({ userId: user._id, type: OTPTypes.unFreeze });
    return next(new Error("this OTP is blocked"));
  }
  if (!compareHash({ plainText: OTP, hashedText: verifyOTP.OTP })) {
    await OTPModel.updateOne(
      { _id: verifyOTP._id },
      { attempts: ++verifyOTP.attempts },
    );
    return next(new Error("in-valid OTP"));
  }
  await userModel.updateOne({ email:user.email },{isDeleted:false, sensitiveUpdateTime:Date.now()} );
  await OTPModel.deleteOne({_id:verifyOTP._id})
  return successResponse({res, status: 201, message: "DONE, you account is active now"})
});



export const deteleUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel.findById(userId, { email: 1, _id: 0 });
  if (!user) {
    return next(new Error("not exist any user with this id"));
  }
  if (user.email != req.body.userEmail) {
    return next(new Error("enter right deleted user email"));
  }
  await userModel.findByIdAndDelete(userId);
  return successResponse({
    res,
    status: 201,
    message: "Done, user Deleted",
    data: user._doc,
  });
});
