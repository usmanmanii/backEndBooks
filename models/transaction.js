const { Schema, model } = require("mongoose");

const TransactionSchema = new Schema({
  isDelivered: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  book: { type: Schema.Types.ObjectId, ref: "book" },
  buyer: { type: Schema.Types.ObjectId, ref: "user" },
  seller: { type: Schema.Types.ObjectId, ref: "user" },
  entryDate: { type: Date, default: Date.now },
});

const TransactionModel = model("order", TransactionSchema);

module.exports = { TransactionSchema, TransactionModel };
