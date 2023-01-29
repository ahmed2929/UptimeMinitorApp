const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var NotificationSchema = new Schema({
  ProfileID:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  },
data:{
    type:Object
 },
 notification:{
     title:String,
     body:String
 },
 action:{
     type:String,
 }

  
 
 
},{ timestamps: true });


const Notification = mongoose.model("notifications", NotificationSchema);

module.exports = Notification;