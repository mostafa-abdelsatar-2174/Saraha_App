import jwt from "jsonwebtoken";

export const generateToken = ({
  payload = {},
  secretKey,
  options = {},
} = {}) => {
  const token = jwt.sign(payload, secretKey, options);
  return token;
};

export const verifyToken = ({ token = "", secretKey } = {}) => {
  const decode = jwt.verify(token, secretKey);
  return decode;
};
