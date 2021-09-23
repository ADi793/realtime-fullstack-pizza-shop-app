const { Pizza, validate } = require("../models/pizza");
const multer = require("multer");
const express = require("express");
const router = express.Router();

// multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const pizzas = await Pizza.find().select("-__v").sort("name");
    res.render("admin/pizzas", {
      pizzas,
      cartTotalQuantity: req.session.cart
        ? req.session.cart.totalQuantity
        : "0",
    });
    // res.status(200).send(pizzas);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.get("/new", (req, res) => {
  res.render("pizzas/new.ejs", {
    cartTotalQuantity: req.session.cart ? req.session.cart.totalQuantity : "0",
  });
});

router.get("/:id", async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza)
      return res.status(404).send("The pizza with the given ID was not found.");

    res.status(200).send(pizza);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.post("/", upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    req.flash("error", "pizza image is required.");
    req.flash("name", req.body.name);
    req.flash("price", req.body.price);
    req.flash("size", req.body.size);
    res.redirect("/pizzas/new");
    return;
  }
  const data = { ...req.body, image: req.file.originalname };

  const { error } = validate(data);
  // if (error) return res.status(400).send(error.details[0].message);
  if (error) {
    req.flash("error", error.details[0].message);
    req.flash("name", req.body.name);
    req.flash("price", req.body.price);
    req.flash("size", req.body.size);
    res.redirect("/pizzas/new");
    return;
  }

  const pizza = new Pizza({
    name: data.name,
    image: data.image,
    price: data.price,
    size: data.size,
  });

  try {
    await pizza.save();
    res.redirect("/pizzas");
    // res.status(200).send("Pizza created.");
  } catch (ex) {
    // res.status(500).send("Something failed.");
    req.flash("error", "An unexpected error occured.");
    req.flash("name", req.body.name);
    req.flash("price", req.body.price);
    req.flash("size", req.body.size);
    res.redirect("/pizzas/new");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      // return res.status(404).send("The pizza with the given ID was not found.");
      return res.render("notFound", {
        cartTotalQuantity: req.session.cart
          ? req.session.cart.totalQuantity
          : "0",
      });
    }

    res.render("pizzas/edit.ejs", {
      pizza,
      cartTotalQuantity: req.session.cart
        ? req.session.cart.totalQuantity
        : "0",
    });
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.put("/:id", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      req.flash("error", "pizza image is required.");
      req.flash("name", req.body.name);
      req.flash("price", req.body.price);
      req.flash("size", req.body.size);
      res.redirect("/pizzas/new");
      return;
    }
    const data = { ...req.body, image: req.file.originalname };
    const { error } = validate(data);
    // if (error) return res.status(400).send(error.details[0].message);
    if (error) {
      req.flash("error", error.details[0].message);
      req.flash("name", req.body.name);
      req.flash("price", req.body.price);
      req.flash("size", req.body.size);
      res.redirect("/pizzas/new");
      return;
    }

    const pizza = await Pizza.findByIdAndUpdate(
      req.params.id,
      {
        name: data.name,
        image: data.image,
        price: data.price,
        size: data.size,
      },
      { new: true }
    );

    if (!pizza) {
      // return res.status(404).send("The pizza with the given ID was not found.");
      return res.redirect("notFound");
    }

    res.redirect("/pizzas");
    // res.status(200).send("The pizza with the given ID is updated.");
  } catch (ex) {
    req.flash("error", "An unexpected error occured.");
    req.flash("name", req.body.name);
    req.flash("price", req.body.price);
    req.flash("size", req.body.size);
    res.redirect("/pizzas/edit");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndRemove(req.params.id);
    if (!pizza) {
      // return res.status(404).send("The pizza with the given ID was not found.");
      return res.redirect("notFound");
    }

    // res.send("The pizza with the given ID is deleted");
    res.redirect("/pizzas");
  } catch (ex) {
    // res.status(500).send("Something failed");
    req.flash("error", "An unexpected error occured.");
    res.redirect("/pizzas");
  }
});

module.exports = router;
