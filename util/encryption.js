const bcrypt = require("bcrypt");
const { CustomError } = require("./error");

module.exports.encryptPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (error) {
    console.log(error);
    throw new CustomError(500, "Server Error");
  }
};

module.exports.comparePassword = async (first, second) => {
  return await bcrypt.compare(first, second);
};
