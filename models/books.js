const { Schema, model } = require("mongoose");

const BookSchema = new Schema({
  title: String,
  author: String,
  description: String,
  edition: String,
  numberOfPages: Number,
  date: Date,
  image: String,
  publisher: String,
  genre: String,
  price: Number,
  isDeleted: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  rent: { type: Boolean, default: false },
  rentPrice: Number,
  entryDate: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "user" },
});

const BookModel = model("book", BookSchema);

module.exports = { BookSchema, BookModel };
