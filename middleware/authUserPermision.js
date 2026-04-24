const jwt = require('jsonwebtoken');
const Model = require('../models/userSchema');

const userAccessPermission = async (req, res, next) => {
  try {
    const cookieToken = req.cookies.userCookie;

    if (!cookieToken) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const validUser = jwt.verify(cookieToken, process.env.JWT_SECRET);
    const user = await Model.findOne({ _id: validUser._id });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    req.token = cookieToken;
    req.userInfo = user;
    next();
  } catch (error) {
    console.log("JWT error:", error.message);
    req.unAuthenticateUser = true;
    return res.status(401).json({ error: "Unauthorized access" });
  }
};


module.exports = userAccessPermission;
