var express = require("express");
const { validateToken, adminGuard } = require("../helpers/auth");
const {
  getAllFood,
  addFood,
  deleteFood,
  payment,
  orderedFood,
  getAllOrders,
  ordersByUser,
  orderById,
  orderStatus,
  addQuantity,
} = require("../controllers/foodController");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Food App" });
});

// user
router.get("/all-food", validateToken, getAllFood);
router.post("/order", validateToken, payment);
router.post("/payment/verify", orderedFood);
router.get("/ordersByUser/:id", validateToken, ordersByUser);

router.get("/orders/:id", validateToken, orderById);

//display in admin
router.post("/add-food", validateToken, adminGuard, addFood);
router.post("/add-quantity", validateToken, adminGuard, addQuantity);
router.delete("/delete-food/:id", validateToken, adminGuard, deleteFood);
router.get("/orders", validateToken, adminGuard, getAllOrders);
router.put("/order-status/:id", validateToken, adminGuard, orderStatus);

module.exports = router;
