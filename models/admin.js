const { Schema, model } = require("mongoose");

const AdminSchema = new Schema({
  username: String,
  password: String,
  type: {
    type: String,
    default: "ADMIN",
  },
});

const AdminModel = model("admin", AdminSchema);

module.exports = { AdminSchema, AdminModel };
