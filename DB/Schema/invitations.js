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
        default:0, // 0:pending, 1:accepted , 2:rejected
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
        CanReadRefile:{
            type:Boolean,
            default:true,
        },
        CanReadAllMeds:{
            type:Boolean,
            default:true,
        },
        CanReadSymptoms:{
            type:Boolean,
            default:true,
        },
        CanWriteSymptoms:{
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
                 ref:"UserMedication",
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
            CanReadRefile:{
                type:Boolean,
                default:true,
            },
            CanWriteRefile:{
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
        CanReadBloodGlucoseMeasurement:{
            type:Boolean,
            default:true,
        },
        CanEditBloodGlucoseMeasurement:{
            type:Boolean,
            default:true,
        },
        CanDeleteBloodGlucoseMeasurement:{
            type:Boolean,
            default:true,
        },
        CanAddBloodGlucoseMeasurement:{
            type:Boolean,
            default:true,
        },
        CanReadBloodPressureMeasurement:{
            type:Boolean,
            default:true,
        },
        CanEditBloodPressureMeasurement:{
            type:Boolean,
            default:true,
        },
        CanDeleteBloodPressureMeasurement:{
            type:Boolean,
            default:true,
        },
        CanAddBloodPressureMeasurement:{
            type:Boolean,
            default:true,
        },
    
    },
    AccountType:{
        /**
         * 1: the receiver will be a dependent
         * 2: if the receiver will be a caregiver,
         * 3: receiver will be MasterToDependent and the old master will be removed,
         * 4: will be MasterToDependent and the old master will remain
         * 
         */
        type:Number,  
        default:1
    },
    externalData:{
        type:Object,
        default:{}
    },


 
 
},{ timestamps: true });



const Invitation = mongoose.model("Invitation", InvitationsSchema);

module.exports = Invitation;