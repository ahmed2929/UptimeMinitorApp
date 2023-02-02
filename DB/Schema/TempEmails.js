const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;


var TempEmailsSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    index:true,
    required: 'Email address is required',
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  
  verificationCode:{
    type:String
  },
  verificationExpiryDate:{
    type:Date
  },
  profile:{
    type:Schema.Types.ObjectId,
    ref:"Profile"
  },
 
 
 
},{ timestamps: true });



const TempEmail = mongoose.model("TempEmail", TempEmailsSchema);

module.exports = TempEmail;