const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var FeedBackSchema = new Schema({
  img:{
   type:String
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
    VoiceRecord:{
        type:String,
        default:null
    
    },
  isDeleted:{
    type:Boolean,
    default:false
  },
  
 
 
},{ timestamps: true });


const FeedBack = mongoose.model("FeedBack", FeedBackSchema);

module.exports = FeedBack;