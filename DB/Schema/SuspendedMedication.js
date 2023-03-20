const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var SuspendedSchema = new Schema({
  Scheduler:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Scheduler'
  },
  Medication:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'UserMedication'
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
  IsDeleted:{
    type:Boolean,
    default:false
  },
  SuspensionStartDate:{
    type:Date
  },
  SuspensionEndDate:{
    type:Date
    },
  SuspensionNote:{
    type:String
    },
  SuspensionVoiceNote:{
    type:String
    },
    UnSuspensionNote:{
      type:String
    }

 
 
},{ timestamps: true });


const SuspendedMedication = mongoose.model("SuspendedMedications", SuspendedSchema);

module.exports = SuspendedMedication;