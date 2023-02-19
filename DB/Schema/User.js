const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;


var userSchema = new Schema({
  firstName:{
    type:String,
  

  },
  lastName:{
    type:String,
    
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
   

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
  verificationCode:{
    type:String
  },
  verificationExpiryDate:{
    type:Date
  },
  mobileNumber:{
    countryCode:{
      type:String,
    
    },
    phoneNumber:{
      type:String,
     
    }
  },
  RestPasswordCode:{
    type:String
  },
  ResetPasswordExpiryDate:{
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
  },
  ShouldRestPassword:{
    type:Boolean,
    default:false
  },
  img:{
    type:String,
    default:null
  },
  IsDependent:{
    type:Boolean,
    default:false
  },
  MasterUsers:[{
    type:Schema.Types.ObjectId,
    ref:"User",
}],
MasterProfiles:[{
    type:Schema.Types.ObjectId,
    ref:"Profile",
}]


 
 
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