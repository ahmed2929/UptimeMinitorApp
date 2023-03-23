const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var MedicationSchema = new Schema({
  img:{
   type:String
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  name:{
    type:String
  },
  description:{
    type:String
  },
  strength:{
    type:Number
  },
  unit:{
      type: String,
        enum : ['g','ml','mg'],
        default: 'g'

  },
  quantity:{
    type:Number
  },
  instructions:{
    type:String
  },
  condition:{
    type:String
  },
  type:{
    type:String,
    default: 'pill'
  },
  Scheduler:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Scheduler'
  },
  externalInfo:{
    type:Object
  },
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
  EditedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  },
  Refile:{
    Refillable:{
      type:Boolean,
      default:false
    },
    RefileLevel:{
      type:Number,
     
    }
  },
  SchedulerHistory:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Scheduler'

  }],
  Ringtone:{
    type:String,
    default:'default'
  },
  fhir:{
    type:Boolean,
    default:false
  }
 

  

 
 
},{ timestamps: true });


const User = mongoose.model("UserMedication", MedicationSchema);

module.exports = User;