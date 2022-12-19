const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;


var AdminSchema = new Schema({
  firstName:{
    type:String,
    required:true,

  },
  lastName:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    index:true,
    required: 'Email address is required',
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  
  password: {
    type: String,
    minlength: 5,
    trim: true,
    select: false,
  },
 
  RestPasswordCode:{
    type:String
  },
  ResetPasswordXpireDate:{
    type:Date
  },
  lang:{
    type:String,
    default:"en"
  }

 
 
},{ timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;