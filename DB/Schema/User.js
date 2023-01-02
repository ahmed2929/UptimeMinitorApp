const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;


var userSchema = new Schema({
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
  verified:{
    type:Boolean,
    default:false
  },
  VerifictionCode:{
    type:String
  },
  VerifictionXpireDate:{
    type:Date
  },
  mobileNumber:{
    countryCode:{
      type:String,
      required:true,
    },
    phoneNumber:{
      type:String,
      required:true
    }
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
  },
  profile:{
    type:Schema.Types.ObjectId,
    ref:"Profile"
  },
  temp:{
    type:Boolean,
    default:false
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

const User = mongoose.model("User", userSchema);

module.exports = User;