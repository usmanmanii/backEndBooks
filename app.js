require("dotenv").config();
module.exports.ROOT_DIRECTORY = __dirname;
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const mongoose = require("mongoose");

// middlewares

app.use(express.static(path.join(this.ROOT_DIRECTORY, "uploads")));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes

app.use("/admin", require("./routes/admin"));
app.use("/user", require("./routes/user"));

// error
app.use((error, req, res, next) => {
  console.log("ERROR OCCURED", error.message, error.stack);
  res.json({
    success: false,
    error: {
      code: error.status,
      message: error.message,
    },
  });
});

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log("Server Started on port " + PORT);
  await mongoose.connect("mongodb://usman:123abcd@ds161901.mlab.com:61901/testingdb", {
  // await mongoose.connect("mongodb://127.0.0.1:27017/books", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  });

  console.log("Connected to DB");
});
