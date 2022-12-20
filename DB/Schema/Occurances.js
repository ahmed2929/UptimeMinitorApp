const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var OccurancesSchema = new Schema({
  Schduler:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Schduler'
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  Medication:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'UserMedcation'
  }
  ,
  PlannedDateTime:{
    type:Date
  },
  PlannedDose:{
    type:Number
  },
  TakeDateTime:{
    type:Date
  },
  TakeDose:{
      type: Number,
  },
  ActionTimeStamp:{
    type:Date
  },
  Status:{
    type:Number,
    enum : [0,1,2,3], // 0: Status mean it's not yet active (future dose), 1: Status mean it's in Transit (time is here , not yet 60 mins passed), 2: status code means it's taken. , 3: it's ignored (60 minutes passed no action
    default: 0
  },
  

 
 
},{ timestamps: true });


const User = mongoose.model("Occurances", OccurancesSchema);

module.exports = User;