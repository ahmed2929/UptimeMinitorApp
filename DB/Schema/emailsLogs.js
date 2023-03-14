const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var EmailLogsSchema = new Schema({
    ReceiverEmail:{
        type:String,
    },
    AzureConfirmation:{
        type:Object,
    },
    error:{
        type:Object,
    }

  
 
},{ timestamps: true });


const EmailLogs = mongoose.model("EmailLogs", EmailLogsSchema);

module.exports = EmailLogs;