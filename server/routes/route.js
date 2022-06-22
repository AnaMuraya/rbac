const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.createUser);

router.post("/login", userController.loginUser);

router.get("/user/:userId", userController.isLoggedIn, userController.getUser);

router.get(
  "/users",
  userController.isLoggedIn,
  userController.grantAccess("readAny", "profile"),
  userController.getUsers
);

router.put(
  "/user/:userId",
  userController.isLoggedIn,
  userController.grantAccess("updateAny", "profile"),
  userController.updateUser
);

router.delete(
  "/user/:userId",
  userController.isLoggedIn,
  userController.grantAccess("deleteAny", "profile"),
  userController.deleteUser
);

module.exports = router;
