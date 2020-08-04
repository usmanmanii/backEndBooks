const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { comparePassword } = require("../util/encryption");

const { initializeAdmin } = require("../middlewares/security");
const { CustomError } = require("../util/error");
const { AdminModel } = require("../models/admin");
const { UserModel } = require("../models/user");
const { BookModel } = require("../models/books");

// signin
router.post("/signin", async (req, res, next) => {
  console.log("checking sign in");
  const { username, password } = req.body;
  try {
    const user = await AdminModel.findOne({ username });
    if (!user) throw new CustomError(404, "admin doesnot exists");
    const match = await comparePassword(password, user.password);

    if (!match) throw new CustomError(400, "Wrong Password");

    const token = jwt.sign(
      {
        user,
      },
      process.env.SECRET
    );

    res.status(200).json({ success: true, user, token });
  } catch (error) {
    next(error);
  }
});

// get all books   getUserBook    getBook
router.get("/books", initializeAdmin, async (req, res, next) => {
  try {
    const books = await BookModel.find({ ...req.query })
      .populate("user")
      .exec();

    res.status(200).json({
      success: true,
      books,
    });
  } catch (error) {
    next(error);
  }
});

// getAllUsers

router.get("/users", initializeAdmin, async (req, res, next) => {
  try {
    const users = await UserModel.find({ ...req.query });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
});

// blockUser

router.get("/block/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });

    user.blocked = !user.blocked;

    res.status(200).json({
      success: true,
      user: await user.save(),
    });
  } catch (error) {
    next(error);
  }
});

// changeBookStatus

router.get("/book/status/:id", initializeAdmin, async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ _id: req.params.id });

    book.approved = !book.approved;

    res.status(200).json({
      success: true,
      book: await book.save(),
    });
  } catch (error) {
    next(error);
  }
});

// deleteBook

router.delete("/books/:id", initializeAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;
    const book = await BookModel.findById(id);
    if (!book) throw new CustomError(404, "book not found");
    book.isDeleted = true;
    await book.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// getTransactions and getUserTransactions

router.get("/transaction", initializeAdmin, async (req, res, next) => {
  const params = req.query;

  try {
    const transactions = await TransactionModel.find(params)
      .populate("book buyer seller")
      .exec();

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
});

router.get("/transaction", initializeAdmin, async (req, res, next) => {
  const id = req.query.user;

  try {
    const transactions = await TransactionModel.find({
      $or: [{ buyer: id }, { seller: id }],
    })
      .populate("book buyer seller")
      .exec();

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
