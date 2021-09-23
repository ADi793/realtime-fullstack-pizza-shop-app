const { Order } = require("../models/order");
const moment = require("moment");
const express = require("express");
const router = express.Router();

router.get("/orders", async (req, res) => {
  let orders;
  try {
    orders = await Order.find({ orderStatus: { $ne: "completed" } })
      .sort("-createdAt")
      .populate("customerId", "name");

    options = [
      "order_placed",
      "confirmed",
      "prepared",
      "delivered",
      "completed",
    ];

    // res.send(orders);
  } catch (ex) {
    orders = [];
  }

  res.render("admin/orders", {
    orders,
    moment,
    options,
    cartTotalQuantity: req.session.cart ? req.session.cart.totalQuantity : "0",
  });
});

module.exports = router;
