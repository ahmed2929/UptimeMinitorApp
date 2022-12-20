const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

var ReportSchema = new Schema({
  medication:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'UserMedcation'

  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  schduler: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Schduler'
  },
  amount:{
    type:Number

  },
  conformied:{
    type:Number,
    default:0
  },
  rejected:{
    type:Number,
    default:0
  }
 
 
 
},{ timestamps: true });


const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;