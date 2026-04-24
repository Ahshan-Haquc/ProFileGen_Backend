const express = require('express');
const authRouter = express.Router();
const UserModel = require('../models/userSchema');
const CVmodel = require('../models/userCVSchema');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const userAccessPermission = require("../middleware/authUserPermision");
const { adminSignup } = require('../controller/auth');


authRouter.get("/", (req, res, next) => {
  try {
    console.log(" to home page.");
    res.status(200).json({ message: "wel to ho me page." });
  } catch (error) {
    next(error);
  }
})

authRouter.post("/userSignup", async (req, res, next) => {
  console.log("working on singup router 1")
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Please enter email or password." })
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const NewUser = new UserModel({
      email: email, password: encryptedPassword, name: name
    })
    const userInfo = await NewUser.save();


    res.status(200).json({ message: "Signup succesfull." });
  } catch (error) {
    next(error);
  }
})

authRouter.post("/auth/admin/signup", adminSignup)

authRouter.post("/userLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // Generate JWT token (assumes generateToken includes role info)
    const token = await user.generateToken();

    // Set token in HTTP-only cookie - eita kaj kore localhost a run krle
    // res.cookie("userCookie", token, {
    //   httpOnly: true,
    //   secure: false, 
    //   expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    // });

    //eita kaj korbe deploye korle
    res.cookie("userCookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only true in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });


    // Final response with role
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


authRouter.get("/userLogout", userAccessPermission, async (req, res, next) => {
  console.log("Request recieved in logout router");
  try {
    const user = await UserModel.findOne({ _id: req.userInfo._id });

    if (user) {
      user.tokens = [];
      await user.save();
    }

    res.clearCookie("userCookie", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout router");
    next(error);
  }
});


authRouter.get("/me", userAccessPermission, async (req, res) => {
  console.log("working on me router")
  res.status(200).json({ userInfo: req.userInfo });
});


module.exports = authRouter;