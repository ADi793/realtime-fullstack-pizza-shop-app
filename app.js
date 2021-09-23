require("dotenv").config();
const passport = require("./config/passport");
const home = require("./routes/home");
const admin = require("./routes/admin");
const orders = require("./routes/orders");
const pizzas = require("./routes/pizzas");
const users = require("./routes/users");
const cart = require("./routes/cart");
const EventEmitter = require("events");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const express = require("express");
const app = express();

mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("Connected to the database...");
  })
  .catch((err) => {
    console.log("Could not connect to database...", err);
  });

// setting up the application
const emitter = new EventEmitter();
app.set("view engine", "ejs");
app.set("emitter", emitter);

// middlewares
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/realtime-pizza-app",
      collectionName: "sessions",
    }),
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// routes
app.use("/", home);
app.use("/pizzas", pizzas);
app.use("/cart", cart);
app.use("/users", users);
app.use("/orders", orders);
app.use("/admin", admin);

app.get("/me", (req, res) => {
  res.send(req.user);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  socket.on("join", (roomName) => {
    socket.join(roomName);
    console.log("Joined in the room...");
  });
});

emitter.on("orderUpdated", (orderData) => {
  io.to(`order_${orderData._id}`).emit("orderUpdated", orderData);
});

emitter.on("orderPlaced", (order) => {
  io.to("adminRoom").emit("orderPlaced", order);
});
