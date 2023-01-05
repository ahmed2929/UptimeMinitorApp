const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var SymtomsSchema = new Schema({
  img:{
   type:String
  },
  Profile:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  },
  User:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  Type:{
    type:String
  },
  Description:{
    type:String
  },
    Severity:{
    type:Number, // 0 mild ,1 monderate, 2 severe
    required:true
    
    },
    StartedIn:{ //defult is the current date
        type:Date,
        default:() => Date.now()
    },
    VoiceRecord:{
        type:String,
        default:null
    
    },
  isDeleted:{
    type:Boolean,
    default:false
  },
  CreatorProfile:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  }


  

 
 
},{ timestamps: true });


const Symptom = mongoose.model("Symptom", SymtomsSchema);

module.exports = Symptom;