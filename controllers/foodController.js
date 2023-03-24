const { foodModel, orderModel } = require("../models/food");
const mongodb = require("mongodb");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const foodController = {
  getAllFood: async (req, res) => {
    try {
      let food = await foodModel.find();
      res.send({
        statusCode: 200,
        food,
      });
    } catch (error) {
      // console.log(error);
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  addFood: async (req, res) => {
    try {
      let food = await foodModel.create(req.body);
      res.send({
        statusCode: 200,
        message: "Food Added successfully",
        food,
      });
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  addQuantity: async (req, res) => {
    try {
      const { id, quantity } = req.body;
      let food = await foodModel.findOne({ _id: id });
      // console.log(food);
      if (food) {
        food.quantity += quantity;
        await food.save();
      }
      res.send({
        food,
      });
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  deleteFood: async (req, res) => {
    try {
      let food = await foodModel.deleteOne({
        _id: mongodb.ObjectId(req.params.id),
      });
      res.send({
        statusCode: 200,
        message: "Food Deleted Successfully",
        food,
      });
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  payment: async (req, res) => {
    try {
      const instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });

      const options = {
        amount: req.body.orderAmount * 100,
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
      };

      if (options.amount !== 0) {
        if (req.body.deliveryAddress !== "" && req.body.contact !== "") {
          instance.orders.create(options, (error, order) => {
            if (error) {
              return res.send({
                statusCode: 400,
                message: "Something went wrong",
              });
            }
            res.send({
              statusCode: 200,
              order,
            });
          });
        } else {
          res.send({
            statusCode: 400,
            message: "Kindly Fill the delivery details",
          });
        }
      } else {
        res.send({
          statusCode: 400,
          message: "Add atleast one food item to place an order",
        });
      }
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  orderedFood: async (req, res) => {
    try {
      const sign =
        req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (req.body.razorpay_signature === expectedSign) {
        // console.log(req.body);
        let order = await orderModel.create({
          payment: {
            razorpay_order_id: req.body.razorpay_order_id,
            razorpay_payment_id: req.body.razorpay_payment_id,
            razorpay_signature: req.body.razorpay_signature,
          },
          ...req.body,
        });
        return res.send({
          statusCode: 200,
          message: "Payment verified and Order Placed",
          order,
        });
      } else {
        res.send({
          statusCode: 400,
          message: "Invalid signature",
        });
      }
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      let orders = await orderModel.find();
      res.send({
        statusCode: 200,
        orders,
      });
    } catch (error) {
      // console.log(error);
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },

  ordersByUser: async (req, res) => {
    try {
      let userOrders = await orderModel.find({ userId: req.params.id });
      res.send({
        statusCode: 200,
        userOrders,
      });
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },

  orderById: async (req, res) => {
    try {
      let order = await orderModel.findOne({
        _id: mongodb.ObjectId(req.params.id),
      });
      res.send({
        statusCode: 200,
        order,
      });
    } catch (error) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  orderStatus: async (req, res) => {
    try {
      let order = await orderModel.findOne({
        _id: mongodb.ObjectId(req.params.id),
      });
      if (order) {
        let newStatus = "";
        switch (order.status) {
          case "Ordered":
            newStatus = "Placed";
            break;
          case "Placed":
            newStatus = "In-Transit";
            break;
          case "In-Transit":
            newStatus = "Delivered";
            break;
          default:
            res.send({
              statusCode: 401,
              message: "Invalid Status",
            });
        }
        if (newStatus) {
          order.status = newStatus;
          await order.save();
          res.send({
            statusCode: 200,
            message: "Status Changed Successfully",
          });
        }
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
};

module.exports = foodController;
