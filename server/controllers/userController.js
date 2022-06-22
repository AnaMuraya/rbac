const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const roles = require("../roles");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

exports.createUser = async (req, res, next) => {
  const { email, password, role } = req.body;
  const hashedPassword = await hashPassword(password);
  const newUser = new User({
    email,
    password: hashedPassword,
    role: role || "basic",
  });
  const accessToken = jwt.sign(
    { userId: newUser._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "5h",
    }
  );
  newUser.accessToken = accessToken;
  try {
    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating user",
      error: err,
    });
    next(err);
  }
};
//User login
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "User not found, please sign up",
      });
    }
    const isValidPassword = await validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials, please try again",
      });
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).json({
      message: "User logged in successfully",
      user,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error logging in user",
      error: err,
    });
    next(err);
  }
};

//get all users
exports.getUsers = async (res, req, next) => {
  const users = await User.find({});
  res.status(200).json({
    users,
  });
};

//get a single user
exports.getUser = async (res, req, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    !user && next(new Error("User not found"));
    res.status(200).json({
      user,
    });
  } catch (err) {
    next(err);
  }
};

//update a user
exports.updateUser = async (res, req) => {
  try {
    const userId = req.params.userId;
    const updateBody = req.body;
    !user &&
      res.status(401).json({
        message: "User not found",
      });
    await User.findByIdAndUpdate(userId, updateBody);
    const user = await User.findById(userId);
    res.status(200).json({
      message: "User update successfully",
      user,
    });
  } catch (err) {
    res.status(401).json({
      message: "Something went wrong while updating" || err,
    });
  }
};

//delete a user
exports.deleteUser = async (res, req) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while deleting" || err,
    });
  }
};

//checking if user is logged in
exports.isLoggedIn = async (res, req, next) => {
  try {
    const user = res.locals.loggedInUser;
    !user &&
      res.status(401).json({
        message: "Please log in first",
      });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

//checking if user has permission
exports.grantAccess = (action, resource) => {
  return async (res, req, next) => {
    try {
      const permission = roles.can(req.user.role)[action](resource);
      !permission.granted &&
        res.status(401).json({
          message: "You do the have permission to perform this action",
        });
      next();
    } catch (err) {
      next(err);
    }
  };
};
