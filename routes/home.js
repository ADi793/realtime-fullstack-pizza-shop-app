const { Pizza } = require("../models/pizza");

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  let pizzas;
  try {
    pizzas = await Pizza.find().sort("name");
  } catch (ex) {
    pizzas = [];
  }

  res.render("home", {
    pizzas,
    cartTotalQuantity: req.session.cart ? req.session.cart.totalQuantity : "0",
  });
});

module.exports = router;
