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

mongoose.connect("mongodb://127.0.0.1:27017/rbac").then(() => {
  console.log("Connected to the database successfully");
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
        error: "JWT token has expired, please login to obtain a new one",
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

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmI2MTVhNjA2YjYzMGY0NGJhN2M5NWEiLCJpYXQiOjE2NTYxMDAyNjIsImV4cCI6MTY1NjExODI2Mn0.EkNWquN2hga-tTy_HxrAnKIkap9l0jzdMfTe597LobY
