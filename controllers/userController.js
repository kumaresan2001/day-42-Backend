const { hashPassword, hashCompare, createToken } = require("../helpers/auth");
const { userModel } = require("../models/user");

const userController = {
  signup: async (req, res) => {
    try {
      let users = await userModel.find({ email: req.body.email });
      if (users.length > 0) {
        res.send({
          statusCode: 400,
          message: "User already exists",
        });
      } else {
        let hashedPassword = await hashPassword(req.body.password);
        req.body.password = hashedPassword;
        // console.log(req.body.password);
        let user = await userModel.create(req.body);
        res.send({
          statusCode: 200,
          message: "Signup successful!!",
          user,
        });
      }
    } catch (error) {
      // console.log(error);
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },

  login: async (req, res) => {
    try {
      let user = await userModel.findOne({ email: req.body.email });
      if (user) {
        let validPw = await hashCompare(req.body.password, user.password);
        if (validPw) {
          let token = await createToken({ email: user.email, role: user.role });
          res.send({
            statusCode: 200,
            message: "Login Successful",
            role: user.role,
            userId: user._id,
            name: user.firstName,
            token,
          });
        } else {
          res.send({
            statusCode: 401,
            message: "Incorrect Password",
          });
        }
      } else {
        res.send({
          statusCode: 400,
          message: "User does not exists",
        });
      }
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },
};

module.exports = userController;
