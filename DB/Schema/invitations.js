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
        CanWriteSymtoms:{
            type:Boolean,
            default:false,
        },
        CanAddMeds:{
            type:Boolean,
            default:true,
        },
        CanReadSpacificMeds:[{
            Med:{
                type:Schema.Types.ObjectId,
                 ref:"UserMedcation",
            },
            CanRead:{
                type:Boolean,
                default:true,
            },
            CanWrite:{
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
            CanWriteRefil:{
                type:Boolean,
                default:false,
            },
            CanWriteDoses:{
                type:Boolean,
                default:false,
            }
            
        }],
        CanWriteDoses:{
            type:Boolean,
            default:false,
        },
    },
    AccountType:{
        type:Number, // 2 if the recevier will be a caregiver 1 for dependent
        default:1
    }

 
 
},{ timestamps: true });



const Invitation = mongoose.model("Invitation", InvitationsSchema);

module.exports = Invitation;