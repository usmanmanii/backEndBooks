const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user");
const { AdminModel } = require("../models/admin");
const { CustomError } = require("../util/error");

module.exports.initializeAdmin = async (req, res, next) => {
  const token = req.headers["auth"];
  console.log("JWT", token);
  try {
    const { user } = jwt.verify(token, process.env.SECRET);
    const match = await AdminModel.findById(user._id);
    if (!match) throw new CustomError(404, "admin not found");
    if (user.type != "ADMIN") throw new CustomError(403, "Permission Denied");
    req.user = match;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports.initializeUser = async (req, res, next) => {
  const token = req.headers["auth"];
  try {
    const { user } = jwt.verify(token, process.env.SECRET);
    const match = await UserModel.findById(user._id);
    if (!match) throw new CustomError(404, "user not found");
    req.user = match;
    next();
  } catch (error) {
    next(error);
  }
};
