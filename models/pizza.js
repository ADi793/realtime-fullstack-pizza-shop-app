const Joi = require("joi");
const mongoose = require("mongoose");

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 255,
    trim: true,
    unique: true,
    required: true,
  },
  image: {
    type: String,
    minLength: 5,
    maxLength: 255,
    trim: true,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  size: {
    type: String,
    minLength: 5,
    maxLength: 255,
    trim: true,
    required: true,
  },
});

const Pizza = mongoose.model("Pizza", pizzaSchema);

function validatePizza(pizza) {
  const schema = {
    name: Joi.string().min(5).max(255).required(),
    image: Joi.string().min(5).max(255).required(),
    price: Joi.number().min(0).required(),
    size: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(pizza, schema);
}

module.exports.Pizza = Pizza;
module.exports.validate = validatePizza;
