const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var OccurrencesSchema = new Schema({
  Scheduler:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Scheduler'
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  Medication:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'UserMedication'
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
  MedInfo:{
    img :{type:String},
    strength:{type:Number},
    unit:{type:String},
    quantity:{type:Number},
    instructions:{type:String},
    condition:{type:String},
    type:{type:String},
    name:{type:String},
    SchedulerType:{
      type:String,
    }
  },
  Status:{
    type:Number,
    enum : [0,1,2,3,4,5], // 0: Status mean it's not yet active (future dose), 1: Status mean it's in Transit (time is here , not yet 60 mins passed), 2: status code means it's taken. , 3: it's ignored (60 minutes passed no action) 4:means its rejected,5:means 30m has passed and his care circle notified
    default: 0
  },
  isSuspended:{
    type:Boolean,
    default:false
  },
  ProfileID:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  },
  CreatorProfile:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  },
  EditedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  },
  DosageID:{
    type:mongoose.Schema.Types.ObjectId,
  },
  RejectionStatus:{
    type:Number,
    //0 i didnt remember/busy,1:medicine is out of stock,2:no need anymore to take this dose 3:shows symptom and side effects,:4cost,5:medicine is far from my side,6:other
  },
  Ringtone:{
    type:String,
  }

 
 
},{ timestamps: true });


const User = mongoose.model("Occurrences", OccurrencesSchema);

module.exports = User;