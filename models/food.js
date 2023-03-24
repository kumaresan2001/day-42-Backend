const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: null },
  quantity: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema({
  orderItems: { type: Array, default: [] },
  userName: { type: String, required: true },
  userId: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  quantity: { type: Number },
  orderAmount: { type: Number, required: true },
  contact: { type: String, required: true },
  payment: { type: Array, default: [] },
  status: { type: String, default: "Ordered" },
  orderedAt: { type: Date, default: Date.now() },
});

let foodModel = mongoose.model("foods", foodSchema);
let orderModel = mongoose.model("orders", orderSchema);

module.exports = { foodModel, orderModel };
