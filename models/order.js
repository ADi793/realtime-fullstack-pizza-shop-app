const Joi = require("joi");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pizzas: {
      type: Object,
      required: true,
    },
    phone: {
      type: String,
      minLength: 5,
      maxLength: 55,
      required: true,
    },
    address: {
      type: String,
      minLength: 5,
      maxLength: 555,
      trim: true,
      required: true,
    },
    paymentType: {
      type: String,
      default: "Cash on delivery",
    },
    orderStatus: {
      type: String,
      default: "order_placed",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

function validateOrder(req) {
  const schema = {
    phone: Joi.string().min(5).max(55).required(),
    address: Joi.string().min(5).max(555).required(),
  };

  return Joi.validate(req, schema);
}

module.exports.Order = Order;
module.exports.validate = validateOrder;
