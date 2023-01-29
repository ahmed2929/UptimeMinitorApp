const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var Scheduler = new Schema({
  medication:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'UserMedication'
  },
  User:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  StartDate:{
    type:Date,
    default:() => Date.now()

  },
  EndDate:{
    type:Date,
    default:null
  },

  AsNeeded:{
    type:Boolean,
    default:false

  },
  ScheduleType:{
    type:Number,
    enum:[0,1,2,3], // 0: Days of week schedule , 1: As Needed  , 2: Every Day , 3: Days Interval
    default:2
  }
  ,
  
  DaysInterval:{
    type:Number,
    default:null
  },
  SpecificDays:{
    type:[String],
    default:null
    },
 
  dosage:
    [
      {
        dose:{
          type:Number,


        },
        DateTime:{
          type:Date
        },
      

      }
    ],
    history:[{
      type:Object
    }],
    isDeleted:{
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
    GenerateAutoOccurrence:{
      type:Boolean,
      default:false
    },
    Archived:{
      type:Boolean,
      default:false
    }
 

 
 
},{ timestamps: true });


const SchedulerSchema = mongoose.model("Scheduler", Scheduler);

module.exports = SchedulerSchema;