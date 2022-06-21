const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "5h",
            }
        );
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
}