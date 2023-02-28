const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var AccessSchema = new Schema({
    Secret:{
        type:String,
    },
    IsActive:{
        type:Boolean,
        default:true
    },
    ExpireDate:{
        type:Date,
    },
    NickName:{
        type:String,
    }
 
},{ timestamps: true });


const Access = mongoose.model("AccessControl", AccessSchema);

module.exports = Access;