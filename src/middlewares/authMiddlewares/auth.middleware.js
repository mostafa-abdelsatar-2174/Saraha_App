import jwt from "jsonwebtoken";
import userModel from "../../DB/models/User.model.js";
import { asyncHandler } from "../../utils/error/error.js";
import { verifyToken } from "../../utils/security/token.js";

export const userRoles = {
  user: "User",
  admin: "Admin",
  superAdmin: "SuperAdmin",
};

export const authentication = asyncHandler(async (req, res, next) => {
  const [bearer, token] = req.headers.authorization?.split(" ") || [];
  if (!bearer || !token) {
    return next(new Error("please enter valid token"));
  }

  let decode = undefined;
  switch (bearer) {
    case "admin":
      decode = verifyToken({
        token,
        secretKey: process.env.JWT_ADMIN_TOKEN_KEY,
      });
      break;
    case "bearer":
      decode = verifyToken({ token, secretKey: process.env.JWT_TOKEN_KEY });
      break;
    default:
      break;
  }
  if (!decode?._id) {
    return next(new Error("in-valid token payload"));
  }
  const user = await userModel.findOne({_id:decode._id, isDeleted:false}, {
    userName: 1,
    email: 1,
    phone: 1,
    age: 1,
    role: 1,
    confirmEmail: 1,
    sensitiveUpdateTime: 1,
  });
  if (!user) {
    return next(new Error("in-valid account", { cause: 404 }));
  }
  //            ms            ==>>    s * 1000
  if (user.sensitiveUpdateTime >= decode.iat * 1000) {
    return next(new Error("this token had expired, login again"));
  }
  req.user = user;
  return next();
});

export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(
        new Error("you don't have the access(un authorized account)", {
          cause: 403,
        }),
      );
    }
    return next();
  });
};
