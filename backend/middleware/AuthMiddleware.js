const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const authorizeUser = asyncHandler(async (req, res, next) => {
  const bearerToken = req.headers?.authorization;

  if (bearerToken?.startsWith("Bearer")) {
    try {
      // 'Bearer asdfasdflnk45y390240' => 'asdfasdflnk45y390240'
      const token = bearerToken.split(" ")[1];

      // Decoding the 'jwt-signed' user from token using 'jwt-secret'
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

      // Attaching currently 'logged-in' user to request object, without password
      req.user = await UserModel.findById(decodedUser.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error(
        "Not Authorized, token failed or expired! Please Logout and Login Again."
      );
    }
  } else {
    res.status(401);
    throw new Error("Not Authorized, no token received!");
  }
});

module.exports = authorizeUser;
