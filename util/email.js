const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_user: process.env.SENDGRID_NAME,
      api_key: process.env.SENDGRID_PASSWORD,
    },
  })
);

module.exports = transporter;
