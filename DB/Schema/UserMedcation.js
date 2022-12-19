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
    type:String
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
 
  Schduler:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Schduler'
  },
  externalInfo:{
    type:Object
  }


  

 
 
},{ timestamps: true });


const User = mongoose.model("UserMedcation", MedictionSchema);

module.exports = User;