const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var MedictionSchema = new Schema({
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
  strenth:{
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
    enum : ['pill','liquid','injection','inhaler','patch','implant','intrauterine device','suppository','topical','other'],
    default: 'pill'
  },
  Schduler:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Schduler'
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
  }


  

 
 
},{ timestamps: true });


const User = mongoose.model("UserMedcation", MedictionSchema);

module.exports = User;