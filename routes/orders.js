const { Order, validate } = require("../models/order");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    req.flash("phone", req.body.phone);
    req.flash("address", req.body.address);
    res.redirect("/cart");
    return;
  }
  // if (error) return res.status(400).send(error.details[0].message);

  const order = new Order({
    customerId: req.user._id,
    pizzas: req.session.cart.pizzas,
    phone: req.body.phone,
    address: req.body.address,
  });

  try {
    await order.save();
    delete req.session.cart;
    const savedOrder = await Order.findById(order._id).populate(
      "customerId",
      "name"
    );

    const emitter = req.app.get("emitter");
    emitter.emit("orderPlaced", savedOrder);
    // res.send("Order is placed...");
    res.redirect("/users/orders");
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true }
    );
    if (!order)
      res.status(400).send("The order with the given ID was not found.");

    const emitter = req.app.get("emitter");
    emitter.emit("orderUpdated", {
      _id: req.params.id,
      orderStatus: order.orderStatus,
      updatedAt: order.updatedAt,
    });
    res.send(order);
  } catch (ex) {
    res.status(500).send("Something went wrong.");
  }
});

module.exports = router;
