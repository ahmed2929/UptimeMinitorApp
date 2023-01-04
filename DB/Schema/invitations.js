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
    },
    permissions:{
        CanWriteMeds:{
            type:Boolean,
            default:true,
        },
        CanReadDoses:{
            type:Boolean,
            default:true,
        },
        CanReadRefil:{
            type:Boolean,
            default:true,
        },
        CanReadAllMeds:{
            type:Boolean,
            default:true,
        },
        CanReadSideEffect:{
            type:Boolean,
            default:true,
        },
        CanReadSpacificMeds:[{
            type:Schema.Types.ObjectId,
            ref:"Medication",
        }]
    },
    AccountType:{
        type:Number
    }

 
 
},{ timestamps: true });



const Invitation = mongoose.model("Invitation", InvitationsSchema);

module.exports = Invitation;