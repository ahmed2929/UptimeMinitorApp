const nodemailer = require('nodemailer');

//initializing variables for mail sending authentication
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.pass;
const transporter = nodemailer.createTransport({
	service: 'gmail', 
    host:'smtp.gmail.com',
	secure:false,
	auth:{
		user:GMAIL_USER,
		pass:GMAIL_PASS
	}
	
})

module.exports = transporter;