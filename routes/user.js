const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();
const { CustomError } = require("../util/error");
const { encryptPassword, comparePassword } = require("../util/encryption");
const { uploads } = require("../util/storage");
const EmailTransporter = require("../util/email");

const { initializeUser } = require("../middlewares/security");

// MODELS
const { UserModel } = require("../models/user");
const { BookModel } = require("../models/books");
const { TransactionModel } = require("../models/transaction");

router.post("/transaction", initializeUser, async (req, res, next) => {
  const { items } = req.body;
  console.log(req.body);

  const orderItems = await Promise.all(
    items.map(async ({ _id }) => {
      const book = await BookModel.findById(_id);
      return new TransactionModel({
        book: book._id,
        buyer: req.user._id,
        seller: book.user,
      }).save();
    })
  );

  console.log(orderItems);

  res.json({ success: true });
});
router.get("/transaction", initializeUser, async (req, res, next) => {
  const params = req.query.type;

  try {
    const transactions = await TransactionModel.find({ [params]: req.user._id })
      .populate("book buyer seller")
      .exec();

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/books",
  initializeUser,
  uploads.single("image"),
  async (req, res, next) => {
    try {
      const book = await new BookModel({
        ...req.body,
        image: req.file.filename,
        user: req.user._id,
      }).save();

      const user = await req.user.save();
      res.status(200).json({ success: true, book, user });
    } catch (error) {
      next(error);
    }
  }
);

// router.get("/all-books", async (req, res, next) => {
//   try {
//     BookModel.find({}, (err, items) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.send(items);
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/all-books", async (req, res, next) => {
  try {
    BookModel.find({}, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.send(items);
      }
    });
  } catch (error) {
    next(error);
  }
});

// get single book
router.get("/books/:id", async (req, res, next) => {
  try {
    const book = await BookModel.findById(req.params.id)
      .populate("user")
      .exec();
    res.status(200).json({ success: true, book });
  } catch (error) {
    next(error);
  }
});

// get all books
router.get("/books", async (req, res, next) => {
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

router.delete("/books/:id", initializeUser, async (req, res, next) => {
  try {
    BookModel.findByIdAndRemove(req.params.id, function (err, post) {
      if (err) return next(err);
      res.json(post);
      console.log(post);
    });
  } catch (error) {
    next(error);
  }
});

// router.delete("/books/:id", initializeUser, async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const book = await BookModel.findById(id);
//     if (!book) throw new CustomError(404, "book not found");

//     book.isDeleted = true;
//     await book.save();

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// });

// get wishlist
router.get("/wishlist", initializeUser, async (req, res, next) => {
  try {
    const user = await req.user.populate("wishlist").execPopulate();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
});

// add to wishlist
router.post("/wishlist", initializeUser, async (req, res, next) => {
  const { bookId } = req.body;
  try {
    const book = await BookModel.findById(bookId);
    if (!book) throw new CustomError(404, "book not found");
    const match = req.user.wishlist.find((id) => id == bookId);
    if (match) {
      req.user.wishlist = req.user.wishlist.filter((id) => id != bookId);
    } else {
      req.user.wishlist = [...req.user.wishlist, bookId];
    }
    const user = await (await req.user.save())
      .populate("wishlist")
      .execPopulate();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
});

// authentication
router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email }).populate("wishlist").exec();
    if (!user) throw new CustomError(404, "user doesnot exists");
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

// register
router.post("/signup", uploads.single("image"), async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  try {
    req.body.password = await encryptPassword(req.body.password);
    const userExists = await UserModel.findOne({ email: req.body.email });
    const token = crypto.randomBytes(64).toString("hex");

    if (userExists) throw new CustomError(400, "user already exists");
    const userDoc = new UserModel({
      ...req.body,
      token,
      image: req.file.filename,
    });
    const response = await userDoc.save();

    res.status(200).json({ success: true, user: response });

    const email = {
      to: userDoc.email,
      from: "muneebg2@gmail.com",
      subject: "Veification Email",
      html: `<p>Please Click on this <a href="${process.env.DOMAIN}/verifyuser/${token}">link</a> to verify </p><p>Link will expire in 10 minutes</p>`,
    };

    EmailTransporter.sendMail(email, function (err, info) {
      if (err) {
        console.log(err);
        throw new CustomError(500, "cannot send email");
      } else {
        console.log("Message sent: " + JSON.stringify(info));
        setTimeout(async () => {
          console.log("token expired");
          userDoc.token = "";
          await userDoc.save();
        }, 1000 * 60 * 10);
      }
    });
  } catch (error) {
    next(error);
  }
});

// verify token
router.post("/verifyuser/:token", async (req, res, next) => {
  const token = req.params.token;
  try {
    if (!token) throw new CustomError(400, "invalid token");
    const user = await UserModel.findOne({ token });
    if (!user) throw new CustomError(404, "invalid token");
    user.isVerified = true;
    user.token = "";
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
