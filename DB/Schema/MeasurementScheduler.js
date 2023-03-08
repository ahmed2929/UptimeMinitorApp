const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var Scheduler = new Schema({
  StartDate:{
    type:Date,
    default:() => Date.now()

  },
  EndDate:{
    type:Date,
    default:null
  },

 
  ScheduleType:{
    type:Number,
    enum:[0,2,3], // 0: Days of week schedule   , 2: Every Day , 3: Days Interval
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
    },
    MeasurementType:{
        type:Number,
        default:0 //0:for BloodGlucose ,1:BloodPressure
    },
    frequencies:[{
      DateTime:{
        type:Date,
      }
    }
    ]
 

 
 
},{ timestamps: true });


const SchedulerSchema = mongoose.model("MeasurementScheduler", Scheduler);

module.exports = SchedulerSchema;