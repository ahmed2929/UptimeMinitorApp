const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var LinkSchema = new Schema({
    ExpireDate:{
        //defulat after 1 month from now
        type:Date,
        default:Date.now()+2592000000
        
    },
    MaxUses:{
    type:Number,
    default:100
    },
    ActionType:{
        //0:for symptom data 
        type:Number,
        required:true  
    },
    SymptomData:{
        type:Schema.Types.ObjectId,
        ref:"Symptom"

    }

  
 
},{ timestamps: true });


const Link = mongoose.model("Link", LinkSchema);

module.exports = Link;