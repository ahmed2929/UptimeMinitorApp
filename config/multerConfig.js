/**
 * Multer middleware for handling file uploads.
 * 
 */
const multer = require("multer");
const path =require("path")
/**
 * Memory storage engine for storing files in memory as Buffer objects.
 * 
 */
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
  })
  /**
 * Multer middleware for handling file uploads.
 * 
 */
const upload = multer({ storage: storage });
module.exports=upload;

