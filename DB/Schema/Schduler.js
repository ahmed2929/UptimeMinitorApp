const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var schduler = new Schema({
  medication:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'UserMedcation'
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  startDay:{
    type:Date
  },
  endDay:{
    type:Date
  },

  asNeeded:{
    type:Boolean,
    default:false

  },
  everyDay:{
    type:Boolean
  },
  daysInterval:{
    type:Number
  },
  spacifcDays:{
    type:[{
      type: String,
    }]
  },
  dosage:{
    type:[
      {
        dose:{
          amount:{
            type:String
          },
          unit:{
            type: String,
          },
          
          strenth:{
            type:String
          }
        } ,
        time:{
          type:Date
        }

      }
    ]
  }

 
 
},{ timestamps: true });


const Schduler = mongoose.model("Schduler", schduler);

module.exports = Schduler;