const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  username: String,
  image: String,
  address: String,
  password: String,
  email: String,
  country: String,
  zipcode: Number,
  city: String,
  address: String,
  blocked: {
    type: Boolean,
    default: false,
  },
  entryDate: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  token: { type: String, default: "" },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "book" }],
});

const UserModel = model("user", UserSchema);

module.exports = { UserSchema, UserModel };
