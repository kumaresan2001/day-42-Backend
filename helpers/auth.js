const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const saltRounds = 12;
const { SECRET_KEY } = process.env;

let hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(saltRounds);
  let hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

let hashCompare = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

let createToken = async ({ email, role }) => {
  let token = await jwt.sign(
    {
      email,
      role,
    },
    SECRET_KEY,
    { expiresIn: "8h" }
  );
  return token;
};

let decodeToken = async (token) => {
  let data = jwt.decode(token);
  return data;
};

let validateToken = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    let data = await decodeToken(token);
    let date = Math.round(new Date() / 1000);
    if (date < +data.exp) {
      next();
    } else {
      res.json({
        statusCode: 400,
        message: "Token Expired",
      });
    }
  } else {
    res.json({
      statusCode: 400,
      message: "No Token Found",
    });
  }
};

// middleware - verify the role
let adminGuard = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    let data = await decodeToken(token);
    if (data.role === "Admin") next();
    else
      res.send({
        statusCode: 401,
        message: "Unauthorized! Only Admin can access",
      });
  } else {
    res.send({
      statusCode: 400,
      message: "No token Found",
    });
  }
};

module.exports = {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validateToken,
  adminGuard,
};
