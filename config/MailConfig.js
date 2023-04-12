const nodemailer = require('nodemailer');
const { EmailClient } = require("@azure/communication-email");
/**
 * Import the EmailClient class from the @azure/communication-email package.
 *
 */

/**
 * Create a new instance of the EmailClient class using a connection string stored in an environment variable.
 * 
 */
const client = new EmailClient(process.env.COMMUNICATION_SERVICES_CONNECTION_STRING);
/**
 * Export the new instance of the EmailClient class as a module.
 * 
 */
module.exports = client;