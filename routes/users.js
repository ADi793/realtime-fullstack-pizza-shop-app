const auth = require("../middlewares/auth");
const { Order } = require("../models/order");
const { User, validate } = require("../models/user");
const moment = require("moment");
const passport = require("passport");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const express = require("express");
const router = express.Router();

router.get("/register", async (req, res) => {
  res.render("users/register", {
    cartTotalQuantity: req.session.cart ? req.session.cart.totalQuantity : "0",
  });
});

router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    req.flash("name", req.body.name);
    req.flash("email", req.body.email);
    res.redirect("/users/register");
    return;
  }
  // if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User is already registered.");

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    await user.save();
    res.redirect("/users/login");
    // res.status(200).send("User is registered.");
  } catch (ex) {
    req.flash("error", "Something failed.");
    res.redirect("/users/register");
    // res.status(500).send("Something failed.");
  }
});

router.get("/login", async (req, res) => {
  res.render("users/login", {
    cartTotalQuantity: req.session.cart ? req.session.cart.totalQuantity : "0",
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

router.get("/logout", async (req, res) => {
  try {
    req.logout();
    res.redirect("/");
  } catch (ex) {}
});

router.get("/orders", auth, async (req, res) => {
  let orders;
  try {
    orders = await Order.find({ customerId: req.user._id }).sort("-createdAt");
  } catch (ex) {
    orders = [];
  }

  res.render("users/orders.ejs", {
    orders,
    moment,
    cartTotalQuantity: req.session.cart ? req.session.cart.totalQuantity : "0",
  });
});

router.get("/orders/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.render("users/order.ejs", { order });
  } catch (ex) {
    // res.send("Order not found.");
    res.render("notFound", {
      cartTotalQuantity: req.session.cart
        ? req.session.cart.totalQuantity
        : "0",
    });
  }
});

function validateRequest(req) {
  const schema = {
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(req, schema);
}

module.exports = router;
