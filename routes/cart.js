const { Pizza } = require("../models/pizza");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("users/cart.ejs", {
    cartTotalQuantity: req.session.cart ? req.session.cart.totalQuantity : "0",
  });
});

router.post("/:id", async (req, res) => {
  const pizza = await Pizza.findById(req.params.id);

  if (!req.session.cart) {
    req.session.cart = {
      pizzas: {},
      totalQuantity: 0,
      totalPrice: 0,
    };
  }

  const cart = req.session.cart;

  if (!cart.pizzas[req.params.id]) {
    cart.pizzas[req.params.id] = { pizza, quantity: 1 };
    cart.totalQuantity = cart.totalQuantity + 1;
    cart.totalPrice = cart.totalPrice + pizza.price;
  } else {
    cart.pizzas[req.params.id].quantity =
      cart.pizzas[req.params.id].quantity + 1;
    cart.totalQuantity = cart.totalQuantity + 1;
    cart.totalPrice = cart.totalPrice + pizza.price;
  }

  res.send({ totalQuantity: cart.totalQuantity });
});

module.exports = router;
