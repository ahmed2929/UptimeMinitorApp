const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

var DosageLog = new Schema({
  Report:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Report'
  },
  status:{
    type:String,
    enum : ['conformed','rejected'],
    default: 'rejected'
  }
 
 
 
},{ timestamps: true });


const DosageLogs = mongoose.model("DosageLog", DosageLog);

module.exports = DosageLogs;