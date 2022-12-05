const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

//initializing variables for mail sending authentication
const GMAIL_USER = process.env.GMAIL_USERNAME;
const GMAIL_PASS = process.env.GMAIL_PASSWORD;

const transporter = nodemailer.createTransport(smtpTransport({
	host: process.env.MAILDOMIN,
	port: 465,
	secure: true,
	auth : {
		user: GMAIL_USER,
		pass: GMAIL_PASS
	}
}))

module.exports = transporter;