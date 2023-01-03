const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;


var DependetSchema = new Schema({
    img:{
    type:String,
    },
  firstName:{
    type:String,
    required:true,

  },
  lastName:{
    type:String,
    required:true,
  },
  nickName:{
    type:String,

  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index:true,
  },
  
  mobileNumber:{
    countryCode:{
      type:String,
     
    },
    phoneNumber:{
      type:String,
    }
  },
 
  MasterProfile:{
    type:Schema.Types.ObjectId,
    ref:"Profile"
  },
  DependentProfile:{
    type:Schema.Types.ObjectId,
    ref:"Profile"
  },


 
 
},{ timestamps: true });



const Dependent = mongoose.model("Dependent", DependetSchema);

module.exports = Dependent;