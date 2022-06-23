const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("./models/userModel");
const routes = require("./routes/route");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/rbac")
.then(() => {
  console.log("Connected to the database successfully");
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (res, req, next) => {
  if (res.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );

    //checking if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res
        .status(401)
        .json({
          error: "JWT token has expired, to get a new one, please log in again",
        });
    }
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});
app.use("/", routes);
app.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});
