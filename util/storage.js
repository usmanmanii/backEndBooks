const multer = require("multer");
const path = require("path");
const { CustomError } = require("./error");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    console.log(file);
    const extension = path.extname(file.originalname);
    const validExtensions = ["jpg", "jpeg", "png"];
    if (validExtensions.includes(extension)) {
      return cb(new CustomError(400, "Only image files are allowed!"), false);
    }

    cb(null, Date.now() + "-" + file.originalname);
  },
});

module.exports.uploads = multer({ storage: storage });
