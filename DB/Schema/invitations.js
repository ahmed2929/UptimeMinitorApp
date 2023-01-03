const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var InvitationsSchema = new Schema({
   From:{
         type:Schema.Types.ObjectId,
            ref:"Profile",
   },
    To:{
        type:Schema.Types.ObjectId,
        ref:"Profile",
    },
    Status:{
        type:Number,
        default:0,
    },
    dependent:{
        type:Schema.Types.ObjectId,
        ref:"Dependent",
    }

 
 
},{ timestamps: true });



const Invitation = mongoose.model("Invitation", InvitationsSchema);

module.exports = Invitation;